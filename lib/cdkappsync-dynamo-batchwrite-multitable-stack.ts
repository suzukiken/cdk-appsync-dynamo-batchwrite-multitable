import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class CdkappsyncDynamoBatchwriteMultitableStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const PREFIX_NAME = id.toLowerCase().replace("stack", "")
    
    // AppSync GraphQL API

    const api = new appsync.GraphqlApi(this, "api", {
      name: PREFIX_NAME + "-api",
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      schema: new appsync.Schema({
        filePath: "graphql/schema.graphql",
      }),
    })
    
    // Dynamo DB Tables

    const product_table = new dynamodb.Table(this, "product_table", {
      tableName: PREFIX_NAME + "Product",
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })
    
    const variant_table = new dynamodb.Table(this, "variant_table", {
      tableName: PREFIX_NAME + "Variant",
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })
    
    // AppSync Datasource
    
    const product_datasource = api.addDynamoDbDataSource(
      "product_datasource",
      product_table
    )
    
    // Grant access to another table

    variant_table.grantReadWriteData(product_datasource)
    
    //
    
    product_datasource.createResolver({
      typeName: "Query",
      fieldName: "listProducts",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    })
    
    // Batch write resolver
    
    product_datasource.createResolver({
      typeName: "Mutation",
      fieldName: "addProductWithDefaultVariant",
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        "mapping_template/add_product_with_default_variant.vtl"
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        "mapping_template/add_product_with_default_variant_result.vtl"
      ),
    })
  
  }
}
