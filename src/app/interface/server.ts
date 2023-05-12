import { ServerStatus } from "../enum/server-status.enum"

export interface Server {
    id: string
    ipAdress: string
    name: string
    memory: string
    type: string
    imageUrl: string
    status: ServerStatus
}