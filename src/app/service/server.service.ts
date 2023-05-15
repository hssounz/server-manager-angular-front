import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';
import { ServerStatus } from '../enum/server-status.enum';

@Injectable({ providedIn: 'root' })
export class ServerService {
  private readonly apiUrl: string = "http://localhost:8088/server";

  constructor(private http: HttpClient) { }


  servers$ = <Observable<CustomResponse>>this.http
    .get<CustomResponse>(`${this.apiUrl}/list`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (server: Server) => <Observable<CustomResponse>>this.http
    .post<CustomResponse>(
      `${this.apiUrl}/save`,
      server
    )
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  ping$ = (ipAddress: string) => <Observable<CustomResponse>>this.http
    .get<CustomResponse>(`${this.apiUrl}/ping/${ipAddress}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  delete$ = (id: string) => <Observable<CustomResponse>>this.http
    .delete<CustomResponse>(`${this.apiUrl}/delete/${id}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  filter$ = (status: ServerStatus, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      subscriber => {
        console.log(response);
        subscriber.next(
          status === ServerStatus.ALL
            ? { ...response, message: `Servers filtered by ${status} status` }
            : {
              ...response,
              message: response.data.servers?.servers?.filter(
                server => server.status === status
              ).length > 0
                ? `Servers filtered by ${status === ServerStatus.SERVER_DOWN
                  ? "SERVER DOWN"
                  : "SERVER UP"
                } status`
                : `No server for: ${status} status`,
              data: {
                
                servers: {
                  ...response.data.servers,
                  servers: response.data.servers.servers?.filter(
                    server => server.status === status
                  )
                }
              }
            }
        );
        subscriber.complete();
      }
    ).pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`Error occured - Error code: ${error.status}`);
  }

  /**
   * 
   * PROCEDURAL APPROACH
   *   getServers(): Observable<CustomResponse> {
   *      return this.http
   *            .get<CustomResponse>(`http://localhost:8088/server/list`)
   *    }
   */


}
