///  <reference types="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'election',
      removal: input?.stage === 'master' ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        aws: {
          region: 'us-west-2',
          version: '6.67.0',
        },
      },
    }
  },
  async run() {
    const aws = await import('@pulumi/aws')
    const pulumi = await import('@pulumi/pulumi')
    const vpc = sst.aws.Vpc.get('api', 'vpc-0763fa52c32ebcf6a')

    if (
      $app.stage !== 'master' &&
      $app.stage !== 'qa' &&
      $app.stage !== 'develop'
    ) {
      throw new Error(
        'Invalid stage. Only master, qa, and develop are supported.',
      )
    }

    let apiDomain: string
    let webAppRootUrl: string
    if ($app.stage === 'master') {
      apiDomain = 'election-api.goodparty.org'
      webAppRootUrl = 'https://goodparty.org'
    } else if ($app.stage === 'develop') {
      apiDomain = 'election-api-dev.goodparty.org'
      webAppRootUrl = 'https://dev.goodparty.org'
    } else {
      apiDomain = `election-api-${$app.stage}.goodparty.org`
      webAppRootUrl = `https://app-${$app.stage}.goodparty.org`
    }

    // function to extract the username, password, and database name from the database url
    // which the docker container needs to run migrations.
    const extractDbCredentials = (dbUrl: string) => {
      const url = new URL(dbUrl)
      const username = url.username
      const password = url.password
      const database = url.pathname.slice(1)
      return { username, password, database }
    }

    // Each stage will get its own Cluster.
    const cluster = new sst.aws.Cluster('fargate', {
      vpc,
      transform: {
        cluster: (clusterArgs, opts, name) => {
          clusterArgs.name = `election-api-${$app.stage}-fargateCluster`
        },
      },
    })

    let dbUrl: string | undefined
    let dbName: string | undefined
    let dbUser: string | undefined
    let dbPassword: string | undefined
    let vpcCidr: string | undefined

    // Fetch the JSON secret using Pulumi's AWS SDK
    let secretArn: string | undefined
    if ($app.stage === 'master') {
      secretArn =
        'arn:aws:secretsmanager:us-west-2:333022194791:secret:ELECTION_API_PROD-PY8oWW'
    } else if ($app.stage === 'develop') {
      secretArn =
        'arn:aws:secretsmanager:us-west-2:333022194791:secret:ELECTION_API_DEV-PY8oWW'
    } else if ($app.stage === 'qa') {
      secretArn =
        'arn:aws:secretsmanager:us-west-2:333022194791:secret:ELECTION_API_QA-w290tg'
    }

    if (!secretArn) {
      throw new Error(
        'No secretArn found for this stage. secretArn must be configured.',
      )
    }

    const secretVersion = aws.secretsmanager.getSecretVersion({
      secretId: secretArn,
    })

    // Use async/await to get the actual secret value
    const secretString = await secretVersion.then((v) => v.secretString)

    const secrets: object[] = []
    let secretsJson: Record<string, string> = {}
    try {
      secretsJson = JSON.parse(secretString || '{}')

      for (const [key, value] of Object.entries(secretsJson)) {
        if (key === 'DATABASE_URL') {
          const { username, password, database } = extractDbCredentials(
            value as string,
          )
          dbUrl = value as string
          dbName = database
          dbUser = username
          dbPassword = password
        }
        if (key === 'VPC_CIDR') {
          vpcCidr = value as string
        }
        secrets.push({ key: value })
      }
    } catch (e) {
      throw new Error(
        'Failed to parse GP_SECRETS JSON: ' + (e as Error).message,
      )
    }

    if (!dbName || !dbUser || !dbPassword || !vpcCidr || !dbUrl) {
      throw new Error('DATABASE_URL, VPC_CIDR keys must be set in the secret.')
    }

    new sst.aws.Service(`election-api-${$app.stage}`, {
      cluster,
      loadBalancer: {
        domain: apiDomain,
        ports: [
          { listen: '80/http' },
          { listen: '443/https', forward: '80/http' },
        ],
        health: {
          '80/http': {
            path: '/v1/health',
            interval: '30 seconds',
          },
        },
      },
      capacity:
        $app.stage === 'master'
          ? {
              fargate: { weight: 1, base: 1 },
              spot: { weight: 1 },
            }
          : {
              spot: { weight: 1, base: 1 },
            },
      memory: $app.stage === 'master' ? '4 GB' : '2 GB',
      cpu: $app.stage === 'master' ? '1 vCPU' : '0.5 vCPU',
      scaling: {
        min: $app.stage === 'master' ? 2 : 1,
        max: $app.stage === 'master' ? 16 : 4,
        cpuUtilization: 50,
        memoryUtilization: 50,
      },
      environment: {
        PORT: '80',
        HOST: '0.0.0.0',
        LOG_LEVEL: 'debug',
        CORS_ORIGIN:
          $app.stage === 'master'
            ? 'goodparty.org'
            : $app.stage === 'develop'
              ? 'dev.goodparty.org,localhost:4000,gp-ui-git-web-3862-election-api-integration-good-party.vercel.app'
              : $app.stage === 'qa'
                ? 'qa.goodparty.org'
                : '',
        AWS_REGION: 'us-west-2',
        WEBAPP_ROOT_URL: webAppRootUrl,
        ...secretsJson,
      },
      image: {
        context: '../',
        dockerfile: './Dockerfile',
        args: {
          DOCKER_BUILDKIT: '1',
          CACHEBUST: '1',
          DATABASE_URL: dbUrl,
          STAGE: $app.stage,
        },
      },
      transform: {
        loadBalancer: {
          idleTimeout: 120,
        },
      },
    })

    let rdsSecurityGroupName: string
    let rdsSecurityGroupId: string

    if ($app.stage === 'develop') {
      rdsSecurityGroupName = 'api-rds-security-group'
      rdsSecurityGroupId = 'sg-0b834a3f7b64950d0'
    } else if ($app.stage === 'master') {
      rdsSecurityGroupName = 'api-master-rds-security-group'
      rdsSecurityGroupId = 'sg-03783e4adbbee87dc'
    } else if ($app.stage === 'qa') {
      rdsSecurityGroupName = 'api-qa-rds-security-group'
      rdsSecurityGroupId = 'sg-0b0a0d163267de5d5'
    } else {
      throw new Error('Unrecognized app stage')
    }

    const rdsSecurityGroup = aws.ec2.SecurityGroup.get(
      rdsSecurityGroupName,
      rdsSecurityGroupId,
    )

    if (!rdsSecurityGroup) {
      throw new Error('RDS Security Group not found')
    }

    const subnetGroupName =
      $app.stage === 'develop'
        ? 'api-rds-subnet-group'
        : `api-${$app.stage}-rds-subnet-group`
    const subnetGroup = await aws.rds.getSubnetGroup({ name: subnetGroupName })

    // Warning: Do not change the clusterIdentifier.
    // The clusterIdentifier is used as a unique identifier for your RDS cluster.
    // Changing it will cause Pulumi/SST to try to create a new RDS cluster and delete the old one
    // which would result in data loss. This is because the clusterIdentifier is part of the cluster's
    // identity and cannot be modified in place.
    let rdsCluster: aws.rds.Cluster
    if (
      $app.stage === 'master' ||
      $app.stage === 'qa' ||
      $app.stage === 'develop'
    ) {
      // Create a new cluster for each stage
      const clusterIdentifier =
        $app.stage === 'master'
          ? 'election-api-db-prod'
          : $app.stage === 'qa'
            ? 'election-api-db-qa'
            : 'election-api-db-develop'

      rdsCluster = new aws.rds.Cluster('rdsCluster', {
        clusterIdentifier,
        engine: aws.rds.EngineType.AuroraPostgresql,
        engineMode: aws.rds.EngineMode.Provisioned,
        engineVersion: '16.2',
        databaseName: dbName,
        masterUsername: dbUser,
        masterPassword: dbPassword,
        dbSubnetGroupName: subnetGroup.name,
        vpcSecurityGroupIds: [rdsSecurityGroup.id],
        storageEncrypted: true,
        deletionProtection: true,
        finalSnapshotIdentifier: `election-api-db-${$app.stage}-final-snapshot`,
        serverlessv2ScalingConfiguration: {
          maxCapacity: 64,
          minCapacity: $app.stage === 'master' ? 1.0 : 0.5,
        },
      })
    } else {
      throw new Error('Unsupported stage')
    }

    new aws.rds.ClusterInstance('rdsInstance', {
      clusterIdentifier: rdsCluster.id,
      instanceClass: 'db.serverless',
      engine: aws.rds.EngineType.AuroraPostgresql,
      engineVersion: rdsCluster.engineVersion,
    })

    const codeBuildRole = new aws.iam.Role('codebuild-service-role', {
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: 'codebuild.amazonaws.com',
      }),
      managedPolicyArns: ['arn:aws:iam::aws:policy/AdministratorAccess'],
    })

    new aws.codebuild.Project('election-api-deploy-build', {
      name: `election-api-deploy-build-${$app.stage}`,
      serviceRole: codeBuildRole.arn,
      environment: {
        computeType: 'BUILD_GENERAL1_LARGE',
        image: 'aws/codebuild/standard:6.0',
        type: 'LINUX_CONTAINER',
        privilegedMode: true,
        environmentVariables: [
          {
            name: 'STAGE',
            value: $app.stage,
            type: 'PLAINTEXT',
          },
          {
            name: 'CLUSTER_NAME',
            value: `election-api-${$app.stage}-fargateCluster`,
            type: 'PLAINTEXT',
          },
          {
            name: 'SERVICE_NAME',
            value: `election-api-${$app.stage}`,
            type: 'PLAINTEXT',
          },
        ],
      },
      vpcConfig: {
        vpcId: 'vpc-0763fa52c32ebcf6a',
        subnets: ['subnet-053357b931f0524d4', 'subnet-0bb591861f72dcb7f'],
        securityGroupIds: ['sg-01de8d67b0f0ec787'],
      },
      source: {
        type: 'GITHUB',
        location: 'https://github.com/thegoodparty/gp-api.git',
        buildspec: 'deploy/buildspec.yml',
      },
      artifacts: {
        type: 'NO_ARTIFACTS',
      },
    })

    new aws.iam.Policy('github-actions-policy', {
      description: 'Limited policy for Github Actions to trigger CodeBuild',
      policy: pulumi.output({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'codebuild:StartBuild',
              'codebuild:BatchGetBuilds',
              'codebuild:ListBuildsForProject',
            ],
            Resource: 'arn:aws:codebuild:us-west:333022194791:project/',
          },
          {
            Effect: 'Allow',
            Action: ['codebuild:ListProjects'],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: ['logs:GetLogEvents', 'logs:FilterLogEvents'],
            Resource: pulumi.interpolate`arn:aws:logs:us-west-2:333022194791:log-group:/aws/codebuild/*`,
          },
        ],
      }),
    })
  },
})
