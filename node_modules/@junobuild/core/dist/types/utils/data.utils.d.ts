import type { Doc } from '../../declarations/satellite/satellite.did';
export declare const mapData: <D>({ data }: Pick<Doc, 'data'>) => Promise<D>;
