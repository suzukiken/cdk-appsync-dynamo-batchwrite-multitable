import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as CdkappsyncDynamoBatchwriteMultitable from '../lib/cdkappsync-dynamo-batchwrite-multitable-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CdkappsyncDynamoBatchwriteMultitable.CdkappsyncDynamoBatchwriteMultitableStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
