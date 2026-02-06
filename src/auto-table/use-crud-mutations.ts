// Libs
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Types
import { CrudMutations } from '../utils/types';

export interface CrudMutationCallbacks {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useCrudMutations<T>(
    mutations: CrudMutations<T>,
    queryKey: string | string[],
    callbacks: CrudMutationCallbacks = {}
) {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (values: Partial<T>) => {
            if (!mutations.create) {
                throw new Error('Create mutation not provided');
            }
            return mutations.create(values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            callbacks.onCreateSuccess?.();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, values }: { id: string | number; values: Partial<T> }) => {
            if (!mutations.update) {
                throw new Error('Update mutation not provided');
            }
            return mutations.update(id, values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            callbacks.onUpdateSuccess?.();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string | number) => {
            if (!mutations.delete) {
                throw new Error('Delete mutation not provided');
            }
            return mutations.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            callbacks.onDeleteSuccess?.();
        },
    });

    return { createMutation, updateMutation, deleteMutation };
}
