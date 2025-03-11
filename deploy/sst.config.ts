///  <reference types="./.sst/platform/config.d.ts" />
import * as aws from '@pulumi/aws'

export default $config({
  app(input) {
    return {
      name: 'gp',
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
    const vpc =
      $app.stage === 'master'
        ? new sst.aws.Vpc('api', {
            bastion: false,
            nat: 'managed',
            az: 2, // defaults to 2 availability zones and 2 NAT gateways
          })
        : sst.aws.Vpc.get('api', 'vpc-0763fa52c32ebcf6a') // other stages will use same vpc.

    if ($app.stage !== 'master' && $app.stage !== 'develop') {
      throw new Error('Invalid stage. Only master and develop are supported.')
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
    const cluster = new sst.aws.Cluster('fargate', { vpc })

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

    // Create a Security Group for the RDS Cluster
    const rdsSecurityGroup = new aws.ec2.SecurityGroup('rdsSecurityGroup', {
      name:
        $app.stage === 'develop'
          ? 'api-rds-security-group'
          : `api-${$app.stage}-rds-security-group`,
      description: 'Allow traffic to RDS',
      vpcId: 'vpc-0763fa52c32ebcf6a',
      ingress: [
        {
          protocol: 'tcp',
          fromPort: 5432,
          toPort: 5432,
          cidrBlocks: [vpcCidr],
        },
      ],
      egress: [
        {
          protocol: '-1',
          fromPort: 0,
          toPort: 0,
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
    })

    // Create a Subnet Group for the RDS Cluster (using our private subnets)
    const subnetGroup = new aws.rds.SubnetGroup('subnetGroup', {
      name:
        $app.stage === 'develop'
          ? 'api-rds-subnet-group'
          : `api-${$app.stage}-rds-subnet-group`,
      subnetIds: ['subnet-053357b931f0524d4', 'subnet-0bb591861f72dcb7f'],
      tags: {
        Name: `api-${$app.stage}-rds-subnet-group`,
      },
    })

    // Warning: Do not change the clusterIdentifier.
    // The clusterIdentifier is used as a unique identifier for your RDS cluster.
    // Changing it will cause Pulumi/SST to try to create a new RDS cluster and delete the old one
    // which would result in data loss. This is because the clusterIdentifier is part of the cluster's
    // identity and cannot be modified in place.
    let rdsCluster: aws.rds.Cluster | undefined
    if ($app.stage === 'master') {
      rdsCluster = new aws.rds.Cluster('rdsCluster', {
        clusterIdentifier: 'election-api-db-prod',
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
      rdsCluster = aws.rds.Cluster.get('rdsCluster', 'election-api-db')
    }

    new aws.rds.ClusterInstance('rdsInstance', {
      clusterIdentifier: rdsCluster.id,
      instanceClass: 'db.serverless',
      engine: aws.rds.EngineType.AuroraPostgresql,
      engineVersion: rdsCluster.engineVersion,
    })
  },
})
