import type {_SERVICE as SatelliteActor, Product, Result} from './satellite.did';
import {idlFactory} from './satellite.factory.did.js';
import {getSatelliteExtendedActor} from '@junobuild/core-peer';

export const buildVersion = async (): Promise<string> => {
	const {build_version} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await build_version();
}

export const createNewProduct = async (value0: Product, value1: string): Promise<Result> => {
	const {create_new_product} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await create_new_product(value0, value1);
}

export const eliminateSolution = async (value0: string): Promise<Result> => {
	const {eliminate_solution} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await eliminate_solution(value0);
}