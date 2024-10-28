import type {_SERVICE as SatelliteActor, Idea, Milestone, Product, SetIdea, Solution, Result} from './satellite.did';
import {idlFactory} from './satellite.factory.did.js';
import {getSatelliteExtendedActor} from '@junobuild/core-peer';

export const buildVersion = async (): Promise<string> => {
	const {build_version} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await build_version();
}

export const createIdeas = async (value0: Array, value1: string): Promise<Result> => {
	const {create_ideas} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await create_ideas(value0, value1);
}

export const createNewProduct = async (value0: Product, value1: string): Promise<Result> => {
	const {create_new_product} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await create_new_product(value0, value1);
}

export const createOrUpdateIdea = async (value0: string, value1: Idea, value2: string): Promise<Result> => {
	const {create_or_update_idea} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await create_or_update_idea(value0, value1, value2);
}

export const createOrUpdateSolution = async (value0: string, value1: Solution, value2: string): Promise<Result> => {
	const {create_or_update_solution} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await create_or_update_solution(value0, value1, value2);
}

export const createOrUpdateTopic = async (value0: string, value1: Idea): Promise<Result> => {
	const {create_or_update_topic} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await create_or_update_topic(value0, value1);
}

export const deletePledge = async (value0: string): Promise<Result> => {
	const {delete_pledge} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await delete_pledge(value0);
}

export const eliminateIdea = async (value0: string): Promise<Result> => {
	const {eliminate_idea} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await eliminate_idea(value0);
}

export const eliminateSolution = async (value0: string): Promise<Result> => {
	const {eliminate_solution} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await eliminate_solution(value0);
}

export const eliminateTopic = async (value0: string): Promise<Result> => {
	const {eliminate_topic} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await eliminate_topic(value0);
}