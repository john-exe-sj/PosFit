// Pool ID: us-west-1_ZgopFe8iU
// Client ID: 14ml5nmitpm0d70082asluqdii
import {CognitoUserPool} from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: "us-east-1_QOD4mBo6F",
    ClientId: "2u5og5gqud9m98ubkb1m9iq2tt"
}

export default new CognitoUserPool(poolData);