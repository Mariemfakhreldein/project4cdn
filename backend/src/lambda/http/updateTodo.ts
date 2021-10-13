import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'


import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { updateTodo } from '../../helpers/todos'
import { getToken } from '../auth/auth0Authorizer'


const logger = createLogger('update-todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    try {
      const todoId: string = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

      const jwtToken: string = getToken(event.headers.Authorization)

      await updateTodo(todoId, updatedTodo, jwtToken)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: ''
      }
    } catch (e) {
      logger.error('Error', { error: e.message })

      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
