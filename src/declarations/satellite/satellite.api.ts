import type {_SERVICE as SatelliteActor, Idea, Milestone, Product, SetIdea, Solution, Result, Result_1} from './satellite.did';
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

export const deleteManyImages = async (value0: string, value1: Array): Promise<Result_1> => {
	const {delete_many_images} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await delete_many_images(value0, value1);
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

export const queryScheduledTasksState = async (): Promise<string> => {
	const {query_scheduled_tasks_state} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await query_scheduled_tasks_state();
}

export const startScheduledTasks = async (): Promise<string> => {
	const {start_scheduled_tasks} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await start_scheduled_tasks();
}

export const stopScheduledTasks = async (): Promise<string> => {
	const {stop_scheduled_tasks} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await stop_scheduled_tasks();
}

export const triggerDeleteOrphanIdeas = async (): Promise<Result> => {
	const {trigger_delete_orphan_ideas} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await trigger_delete_orphan_ideas();
}

export const triggerDeleteOrphanSolutions = async (): Promise<Result> => {
	const {trigger_delete_orphan_solutions} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await trigger_delete_orphan_solutions();
}

export const triggerDeleteUnusedImages = async (): Promise<Result> => {
	const {trigger_delete_unused_images} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await trigger_delete_unused_images();
}

export const uploadImage = async (value0: string, value1: string, value2: unknown, value3: string, value4: string, value5: string): Promise<Result_1> => {
	const {upload_image} = await getSatelliteExtendedActor<SatelliteActor>({
		idlFactory
	});

	return await upload_image(value0, value1, value2, value3, value4, value5);
}