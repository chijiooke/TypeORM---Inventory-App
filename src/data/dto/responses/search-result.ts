import { Type } from 'class-transformer';
import { Min } from 'class-validator';

export class SearchResult<T> {
    @Type(() => Number)
    limit: number;

    @Type(() => Number)
    offset: number;

    @Type(() => Number)
    totalProducts: number;

    @Type(() => Number)
    totalItemCount: number;

    results: T[];
}
