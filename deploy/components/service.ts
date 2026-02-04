import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'
import { sortBy } from 'lodash'

export interface ServiceConfig {
  environment: 'dev' | 'qa' | 'prod'
  stage: string

  imageUri: string

  vpcId: string
  securityGroupIds: string[]
  publicSubnetIds: string[]

  hostedZoneId: string
  domain: string
  certificateArn: string

  secrets: pulumi.Input<Record<string, pulumi.Input<string>>>
  environmentVariables: pulumi.Input<Record<string, pulumi.Input<string>>>

  permissions: pulumi.Input<
    {
      Effect: 'Allow' | 'Deny'
      Action: string[]
      Resource: pulumi.Input<pulumi.Input<string>[]>
    }[]
  >
}

type ServiceOutput = {
  url: pulumi.Output<string>
  logGroupName: pulumi.Output<string>
  logGroupArn: pulumi.Output<string>
}

export function createService({
  environment,
  stage,
  imageUri,
  vpcId,
  securityGroupIds,
  publicSubnetIds,
  hostedZoneId,
  domain,
  certificateArn,
  secrets,
  environmentVariables,
  permissions,
}: ServiceConfig): ServiceOutput {
  const isProd = environment === 'prod'
  const serviceName = `election-api-${stage}`

  const select = <T>(values: Record<'dev' | 'qa' | 'prod', T>): T =>
    values[environment]

  const cluster = new aws.ecs.Cluster(
    'ecsCluster',
    {
      name: `election-api-${stage}-fargateCluster`,
      settings: [{ name: 'containerInsights', value: 'enabled' }],
    },
    {
      import: select({
        dev: 'election-api-develop-fargateCluster',
        qa: 'election-api-qa-fargateCluster',
        prod: 'election-api-master-fargateCluster',
      }),
    },
  )

  const albSecurityGroup = new aws.ec2.SecurityGroup(
    'albSecurityGroup',
    {
      name: select({
        dev: 'election-api-developLoadBalancerSecurityGroup-e4893c5',
        qa: 'election-api-qaLoadBalancerSecurityGroup-c78a1aa',
        prod: 'election-api-masterLoadBalancerSecurityGroup-80ea98d',
      }),
      description: 'Managed by SST',
      vpcId,
      ingress: [
        {
          protocol: 'tcp',
          fromPort: 80,
          toPort: 80,
          cidrBlocks: ['0.0.0.0/0'],
          description: 'HTTP',
        },
        {
          protocol: 'tcp',
          fromPort: 443,
          toPort: 443,
          cidrBlocks: ['0.0.0.0/0'],
          description: 'HTTPS',
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
    },
    {
      import: select({
        dev: 'sg-0951059626f45c755',
        qa: 'sg-0bffd0811188a4a7d',
        prod: 'sg-0cbfae998063c0569',
      }),
    },
  )

  const loadBalancer = new aws.lb.LoadBalancer(
    'loadBalancer',
    {
      name: select({
        dev: 'electionapideve-xrhtdsta',
        qa: 'electionapiqaLo-thcbahvn',
        prod: 'electionapimast-hhnbxfdh',
      }),
      internal: false,
      loadBalancerType: 'application',
      securityGroups: [albSecurityGroup.id],
      subnets: publicSubnetIds,
      enableCrossZoneLoadBalancing: true,
      idleTimeout: 120,
    },
    {
      import: select({
        dev: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:loadbalancer/app/electionapideve-xrhtdsta/f8d781346ff9d01e',
        qa: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:loadbalancer/app/electionapiqaLo-thcbahvn/705a9d447db8113c',
        prod: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:loadbalancer/app/electionapimast-hhnbxfdh/1646745475f3548c',
      }),
    },
  )

  const targetGroup = new aws.lb.TargetGroup(
    'targetGroup',
    {
      name: select({
        dev: 'HTTP20250407183025279100000002',
        qa: 'HTTP20250422004715613800000002',
        prod: 'HTTP20250422010840834800000002',
      }),
      port: 80,
      protocol: 'HTTP',
      targetType: 'ip',
      vpcId,
      deregistrationDelay: 120,
      healthCheck: {
        path: '/v1/health',
        interval: 60,
        timeout: 5,
        healthyThreshold: 2,
        unhealthyThreshold: 3,
        matcher: '200',
      },
    },
    {
      import: select({
        dev: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:targetgroup/HTTP20250407183025279100000002/6b35f3d8c4b3002d',
        qa: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:targetgroup/HTTP20250422004715613800000002/1c4a643640b621bd',
        prod: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:targetgroup/HTTP20250422010840834800000002/948cc68497938ecf',
      }),
    },
  )

  new aws.lb.Listener(
    'httpListener',
    {
      loadBalancerArn: loadBalancer.arn,
      port: 80,
      protocol: 'HTTP',
      defaultActions: [{ type: 'forward', targetGroupArn: targetGroup.arn }],
    },
    {
      import: select({
        dev: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:listener/app/electionapideve-xrhtdsta/f8d781346ff9d01e/e2bdde51e904aff9',
        qa: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:listener/app/electionapiqaLo-thcbahvn/705a9d447db8113c/e0177105ef8b480c',
        prod: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:listener/app/electionapimast-hhnbxfdh/1646745475f3548c/c86f5f162814b83e',
      }),
    },
  )

  new aws.lb.Listener(
    'httpsListener',
    {
      loadBalancerArn: loadBalancer.arn,
      port: 443,
      protocol: 'HTTPS',
      certificateArn,
      sslPolicy: 'ELBSecurityPolicy-TLS13-1-2-2021-06',
      defaultActions: [{ type: 'forward', targetGroupArn: targetGroup.arn }],
    },
    {
      import: select({
        dev: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:listener/app/electionapideve-xrhtdsta/f8d781346ff9d01e/30d36aa35830dace',
        qa: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:listener/app/electionapiqaLo-thcbahvn/705a9d447db8113c/76a94f02db87f11b',
        prod: 'arn:aws:elasticloadbalancing:us-west-2:333022194791:listener/app/electionapimast-hhnbxfdh/1646745475f3548c/9223a248a927ee5f',
      }),
    },
  )

  const logGroup = new aws.cloudwatch.LogGroup(
    'logGroup',
    {
      name: `/sst/cluster/election-api-${stage}-fargateCluster/election-api-${stage}/election-api-${stage}`,
      retentionInDays: isProd ? 60 : 30,
    },
    {
      import: select({
        dev: '/sst/cluster/election-api-develop-fargateCluster/election-api-develop/election-api-develop',
        qa: '/sst/cluster/election-api-qa-fargateCluster/election-api-qa/election-api-qa',
        prod: '/sst/cluster/election-api-master-fargateCluster/election-api-master/election-api-master',
      }),
    },
  )

  const executionRole = new aws.iam.Role(
    'executionRole',
    {
      name: select({
        dev: 'election-develop-electionapidevelopExecutionRole-badzffuf',
        qa: 'election-qa-electionapiqaExecutionRole-vemkvkek',
        prod: 'election-master-electionapimasterExecutionRole-rrbnxccf',
      }),
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'ecs-tasks.amazonaws.com',
            },
          },
        ],
      }),
      managedPolicyArns: [
        'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      ],
      inlinePolicies: [
        {
          name: 'inline',
          policy: pulumi.jsonStringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                  'ssm:GetParameters',
                  'ssm:GetParameterHistory',
                  'ssm:GetParameter',
                  'secretsmanager:GetSecretValue',
                ],
                Resource: '*',
              },
            ],
          }),
        },
      ],
    },
    {
      import: select({
        dev: 'election-develop-electionapidevelopExecutionRole-badzffuf',
        qa: 'election-qa-electionapiqaExecutionRole-vemkvkek',
        prod: 'election-master-electionapimasterExecutionRole-rrbnxccf',
      }),
    },
  )

  const taskRole = new aws.iam.Role(
    'taskRole',
    {
      name: select({
        dev: 'election-develop-electionapidevelopTaskRole-mubedrbn',
        qa: 'election-qa-electionapiqaTaskRole-hovhdtaf',
        prod: 'election-master-electionapimasterTaskRole-odxmbean',
      }),
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'ecs-tasks.amazonaws.com',
            },
          },
        ],
      }),
      inlinePolicies: [
        {
          name: 'inline',
          policy: pulumi.jsonStringify({
            Version: '2012-10-17',
            Statement: permissions,
          }),
        },
      ],
    },
    {
      import: select({
        dev: 'election-develop-electionapidevelopTaskRole-mubedrbn',
        qa: 'election-qa-electionapiqaTaskRole-hovhdtaf',
        prod: 'election-master-electionapimasterTaskRole-odxmbean',
      }),
    },
  )

  const cpu = isProd ? '1024' : '512'
  const memory = isProd ? '4096' : '2048'

  const taskDefinition = new aws.ecs.TaskDefinition('taskDefinition', {
    family: `election-api-${stage}-fargateCluster-election-api-${stage}`,
    networkMode: 'awsvpc',
    requiresCompatibilities: ['FARGATE'],
    cpu,
    memory,
    executionRoleArn: executionRole.arn,
    taskRoleArn: taskRole.arn,
    runtimePlatform: {
      cpuArchitecture: 'X86_64',
      operatingSystemFamily: 'LINUX',
    },
    containerDefinitions: pulumi.jsonStringify(
      pulumi.all([environmentVariables, secrets]).apply(([env, sec]) => [
        {
          name: serviceName,
          image: imageUri,
          cpu: parseInt(cpu),
          memory: parseInt(memory),
          essential: true,
          secrets: sortBy(Object.entries(sec), ([name]) => name).map(
            ([name, valueFrom]) => ({
              name,
              valueFrom,
            }),
          ),
          portMappings: [
            {
              containerPort: 80,
              hostPort: 80,
              protocol: 'tcp',
            },
          ],
          environment: sortBy(Object.entries(env), [([name]) => name]).map(
            ([name, value]) => ({
              name,
              value,
            }),
          ),
          logConfiguration: {
            logDriver: 'awslogs',
            options: {
              'awslogs-group': logGroup.name,
              'awslogs-region': 'us-west-2',
              'awslogs-stream-prefix': '/service',
            },
          },
          pseudoTerminal: true,
          linuxParameters: {
            initProcessEnabled: true,
          },
        },
      ]),
    ),
  })

  new aws.ecs.Service(
    'ecsService',
    {
      name: serviceName,
      cluster: cluster.arn,
      taskDefinition: taskDefinition.arn,
      desiredCount: isProd ? 2 : 1,
      capacityProviderStrategies: [{ capacityProvider: 'FARGATE', weight: 1 }],
      networkConfiguration: {
        subnets: publicSubnetIds,
        securityGroups: securityGroupIds,
        assignPublicIp: true,
      },
      loadBalancers: [
        {
          targetGroupArn: targetGroup.arn,
          containerName: serviceName,
          containerPort: 80,
        },
      ],
      healthCheckGracePeriodSeconds: 120,
      deploymentCircuitBreaker: {
        enable: true,
        rollback: true,
      },
      enableExecuteCommand: true,
      forceNewDeployment: true,
      waitForSteadyState: true,
    },
    {
      import: select({
        dev: 'election-api-develop-fargateCluster/election-api-develop',
        qa: 'election-api-qa-fargateCluster/election-api-qa',
        prod: 'election-api-master-fargateCluster/election-api-master',
      }),
    },
  )

  new aws.route53.Record(
    'dnsARecord',
    {
      zoneId: hostedZoneId,
      name: domain,
      type: 'A',
      aliases: [
        {
          name: loadBalancer.dnsName,
          zoneId: loadBalancer.zoneId,
          evaluateTargetHealth: true,
        },
      ],
    },
    {
      import: select({
        dev: 'Z10392302OXMPNQLPO07K_election-api-dev.goodparty.org_A',
        qa: 'Z10392302OXMPNQLPO07K_election-api-qa.goodparty.org_A',
        prod: 'Z10392302OXMPNQLPO07K_election-api.goodparty.org_A',
      }),
    },
  )
  new aws.route53.Record(
    'dnsAAAARecord',
    {
      zoneId: hostedZoneId,
      name: domain,
      type: 'AAAA',
      aliases: [
        {
          name: loadBalancer.dnsName,
          zoneId: loadBalancer.zoneId,
          evaluateTargetHealth: true,
        },
      ],
    },
    {
      import: select({
        dev: 'Z10392302OXMPNQLPO07K_election-api-dev.goodparty.org_AAAA',
        qa: 'Z10392302OXMPNQLPO07K_election-api-qa.goodparty.org_AAAA',
        prod: 'Z10392302OXMPNQLPO07K_election-api.goodparty.org_AAAA',
      }),
    },
  )

  return {
    url: pulumi.interpolate`https://${domain}`,
    logGroupName: logGroup.name,
    logGroupArn: logGroup.arn,
  }
}
