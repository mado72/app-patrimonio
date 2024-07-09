import { format } from "date-fns";

export function formatRequestDate(body: any): any {
    if (body === null || body === undefined || typeof body !== 'object') {
        return body;
    }
    body = Object.assign({}, body);
    Object.keys(body).forEach(k => {
        let val = (body as any)[k];
        if (!!val && val.getMonth !== undefined && typeof val.getMonth === 'function') {
            (body as any)[k] = format(val, 'yyyy-MM-dd');
        }
    });
    return body;
}
