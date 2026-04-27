import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Task, TaskPayload, TaskFilters, TaskMetrics, Subtask } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private base = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(filters: TaskFilters = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Task[]>(this.base, { params });
  }

  getOne(id: number) {
    return this.http.get<Task>(`${this.base}/${id}`);
  }

  create(payload: TaskPayload) {
    return this.http.post<Task>(this.base, payload);
  }

  update(id: number, payload: Partial<TaskPayload>) {
    return this.http.put<Task>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  archive(id: number) {
    return this.http.put<Task>(`${this.base}/${id}`, { archived: true });
  }

  getMetrics() {
    return this.http.get<TaskMetrics>(`${this.base}/metrics`);
  }

  generateWithAI(prompt: string) {
    return this.http.post<Task[]>(`${environment.apiUrl}/ai/generate`, { prompt });
  }

  toggleSubtask(subtaskId: number) {
    return this.http.patch<Subtask>(`${environment.apiUrl}/subtasks/${subtaskId}/toggle`, {});
  }
}
