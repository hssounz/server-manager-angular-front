import { Server } from "./server"

export interface CustomResponse {
    timeStamp: Date
    statusCode: number
    status: string
    reason: string
    message: string
    developerMessage: string
    data: {
        servers?: {
            currentPage: number,
            pageSize: number
            totalPages: number
            servers: Server[]
        },
        server?: Server
    }
}