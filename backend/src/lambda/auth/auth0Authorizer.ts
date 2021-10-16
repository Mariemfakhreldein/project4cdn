import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
//import { Jwt } from '../../auth/Jwt'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set


const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJSdO6U6XI7W0TMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi02M3JtbXZhcC51cy5hdXRoMC5jb20wHhcNMjExMDA5MjExMDEyWhcN
MzUwNjE4MjExMDEyWjAkMSIwIAYDVQQDExlkZXYtNjNybW12YXAudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvDsmgcZ/GA4vCS/M
6Az38PKonH15hvID9HrznGBocM7iPcPIiUsu6Mfs+a0Is4Bt7AN3lBVs0IKCa486
31fkxmc57d3APmM108Jz7Tk2Zk8qfYYZQwBYGroE60lJ0n4M/abVfNPdPCmn2YO5
4zm4UBYA7UMK/mqnGgIF1ye23xum0b+1k9Uo5Oz+TcBC+aK/vp4KSliQrz0UxpKj
INHc7pY6wMdiMD/o4i0LMbqfRjrEhaPr1iTdZb0CpChfRFMNPrf0Rka4G5OqvLAE
KN20UIsJsg28lBxAvUZ2N+oZwWNjm2s1YIIroNzgS6yOCSvBGkR78LyFuCRmN0ws
wNcefwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRJUeh8PRLf
DR4GgdpISY/5mWy6vTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AFOmUZ3UM0ju0jYwkYArMXxdVjwNHUTc8JWOjuE+IdKfnj4/6fvkRECfMwezJUsK
b7AsqNR+ttblH6+9+4SoYoj/yyvZlZLfciNp5UAfMVbONuiNdJw9KGoq1+Y9ZEwe
DVTlOMORyTb8P4VX2HXiQWf0ELE0zqcakK+FH+zYy0V0JhjjpqS1KHmq6lzpJUY5
aBryHeJLxwJ3DTYNp6Ce1+tB0PVllwG2OgUMXELtpAxJyd4JorxCGUO9C5db6Oza
PGiV6b5HH9vDcXyBzb547wT9eElwwrGv4N1+IK3egbDbQ3X+e7I5CdB4rWkkvFCU
B6HVUnVr/vGN4WFtOwuD0Bc=
-----END CERTIFICATE-----`


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('this is me')
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/


  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload

}

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
