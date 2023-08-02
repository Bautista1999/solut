import type { ListParams as ListParamsApi } from '../../declarations/satellite/satellite.did';
import type { ListParams } from '../types/list.types';
export declare const toListParams: ({ matcher, paginate, order, owner }: ListParams) => ListParamsApi;
