import { Component, OnInit } from '@angular/core';
import { ServerService } from './service/server.service';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs'
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { DataState } from './enum/data-state-enum';
import { Server } from './interface/server';
import { ServerStatus } from './enum/server-status.enum';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  appState$: Observable<AppState<CustomResponse>>;
  readonly DataState = DataState;
  readonly ServerStatus = ServerStatus;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();



  constructor(private serverService: ServerService) { }

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$.pipe(
      map(response => {
        this.dataSubject.next(response);
        return {
          dataState: DataState.LOADED_STATE,
          appData: response
        }
      }),
      startWith({
        dataState: DataState.LOADING_STATE
      }),
      catchError((error: string) => {
        return of({
          dataState: DataState.ERROR_STATE,
          error
        })
      })
    );
  }

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serverService.ping$(ipAddress).pipe(
      map(response => {
        this.dataSubject.value.data.servers.servers[
          this.dataSubject.value.data.servers.servers.findIndex(
            server => server.id === response.data.server.id
          )
        ] = response.data.server;
        this.filterSubject.next('');
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value
        }
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: string) => {
        this.filterSubject.next('');
        return of({
          dataState: DataState.ERROR_STATE,
          error
        })
      })
    );
  }

  filterServers(event: any): void {
    var status: ServerStatus = event.target.value;
    this.appState$ = this.serverService.filter$(status, this.dataSubject.value).pipe(
      map(response => {
        return {
          dataState: DataState.LOADED_STATE,
          appData: response
        }
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: string) => {
        return of({
          dataState: DataState.ERROR_STATE,
          error
        });
      })
    );
  }

  saveServer(serverForm: NgForm): void {
    console.log(serverForm.value);
    console.log("test");
    this.isLoadingSubject.next(true);
    this.appState$ = this.serverService.save$(serverForm.value as Server).pipe(
      map(response => {
        this.dataSubject.next(
          {...response, data: {
            servers: {
              ...this.dataSubject.value.data.servers,
              servers: [response.data.server, ...this.dataSubject.value.data.servers.servers]
            }
          }}
        );
        document.getElementById('closeModal').click();
        this.isLoadingSubject.next(false);
        serverForm.resetForm({status : this.ServerStatus.SERVER_DOWN});
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value
        }
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: string) => {
        this.isLoadingSubject.next(false);
        return of({
          dataState: DataState.ERROR_STATE,
          error
        })
      })
    );
  }

  deleteServer(server: Server): void {
    this.appState$ = this.serverService.delete$(server.id).pipe(
      map(response => {
        this.dataSubject.next(
          {...response, 
            data: { 
              servers: {
                ...this.dataSubject.value.data.servers, 
                servers: this.dataSubject.value.data.servers.servers.filter(s => s.id !== server.id)
              }
            }
          }
        )
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value
        }
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: string) => {
        return of({
          dataState: DataState.ERROR_STATE,
          error
        })
      })
    );
  }

  printReport(): void{
    window.print();
    // let dataType= 'application/vnd.ms-excel.sheet.marcoEnabled.12'
    // let tableSelect = document.getElementById('servers');
    // let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20');
    // let downloadLink = document.createElement('a');
    // document.body.appendChild(downloadLink);
    // downloadLink.href = 'data:' + dataType + ', ' + tableHtml;
    // downloadLink.download = 'servers-report.xls';
    // downloadLink.click();
    // document.body.removeChild(downloadLink);
  }

}
