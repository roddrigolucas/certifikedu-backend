import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { format } from 'date-fns';

@Injectable()
export class DateFormat implements NestInterceptor {
  private readonly fields: string[];

  constructor(fields: string[]) {
    this.fields = fields;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformDatesInResponse(data)));
  }

  private transformDatesInResponse(obj: any): any {
    if (obj instanceof Array) {
      return obj.map((item) => this.transformDatesInResponse(item));
    } else if (obj !== null && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        if (this.fields.includes(key) && value instanceof Date) {
          obj[key] = format(obj[key], 'dd/MM/yyyy');
        } else if (value instanceof Array || (value !== null && typeof value === 'object')) {
          obj[key] = this.transformDatesInResponse(value);
        }
      });
      return obj;
    } else {
      return obj;
    }
  }
}
