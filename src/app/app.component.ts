import { Component, OnInit } from '@angular/core';
import { ServerService } from './service/server.service';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs'
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { DataState } from './enum/data-state-enum';
import { Server } from './interface/server';
import { ServerStatus } from './enum/server-status.enum';

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
  filterStatus$ = this.filterSubject.asObservable();




  constructor(private serverService: ServerService) { }

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$.pipe(
      map(response => {
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

}
