// hooks/use-prayer-queries.ts
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {diaryApi, historyApi, prayerApi} from '@/lib/api-client';
import {toast} from 'sonner';

// Query Keys - centralized for consistency
export const queryKeys = {
    prayers: {
        all: ['prayers'] as const,
        byDate: (date: string) => ['prayers', date] as const,
    },
    diary: {
        all: ['diary'] as const,
        byDate: (date: string) => ['diary', date] as const,
    },
    history: {
        combined: ['history', 'combined'] as const,
    },
};

// Prayer Queries
export function usePrayerByDate(date: string | undefined, enabled = true) {
    return useQuery({
        queryKey: queryKeys.prayers.byDate(date || ''),
        queryFn: () => prayerApi.getByDate(date!),
        enabled: !!date && enabled,
    });
}

export function useAllPrayers() {
    return useQuery({
        queryKey: queryKeys.prayers.all,
        queryFn: prayerApi.getAll,
    });
}

// Prayer Mutations
export function useCreatePrayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: prayerApi.create,
        onSuccess: (data, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({queryKey: queryKeys.prayers.all});
            queryClient.invalidateQueries({
                queryKey: queryKeys.prayers.byDate(variables.date)
            });
            queryClient.invalidateQueries({queryKey: queryKeys.history.combined});

            toast.success('Prayer log saved successfully!', {
                description: `Prayer log for ${variables.date} has been recorded.`,
            });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to save prayer log');
        },
    });
}

export function useUpdatePrayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, ...data}: any) => prayerApi.update(id, data),
        onMutate: async ({date, ...newData}) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: queryKeys.prayers.byDate(date)
            });

            // Snapshot previous value
            const previousData = queryClient.getQueryData(
                queryKeys.prayers.byDate(date)
            );

            // Optimistically update cache
            queryClient.setQueryData(
                queryKeys.prayers.byDate(date),
                (old: any) => ({
                    ...old,
                    data: {...old?.data, ...newData},
                })
            );

            return {previousData, date};
        },
        onError: (err, variables, context: any) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    queryKeys.prayers.byDate(context.date),
                    context.previousData
                );
            }
            toast.error('Failed to update prayer log');
        },
        onSuccess: (data, variables) => {
            toast.success('Prayer log updated successfully!', {
                description: `Prayer log for ${variables.date} has been updated.`,
            });
        },
        onSettled: (data, error, variables) => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({
                queryKey: queryKeys.prayers.byDate(variables.date)
            });
            queryClient.invalidateQueries({queryKey: queryKeys.prayers.all});
            queryClient.invalidateQueries({queryKey: queryKeys.history.combined});
        },
    });
}

// Diary Queries
export function useDiaryByDate(date: string | undefined, enabled = true) {
    return useQuery({
        queryKey: queryKeys.diary.byDate(date || ''),
        queryFn: () => diaryApi.getByDate(date!),
        enabled: !!date && enabled,
    });
}

export function useAllDiaries() {
    return useQuery({
        queryKey: queryKeys.diary.all,
        queryFn: diaryApi.getAll,
    });
}

// Diary Mutations
export function useCreateDiary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: diaryApi.create,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: queryKeys.diary.all});
            queryClient.invalidateQueries({
                queryKey: queryKeys.diary.byDate(variables.date)
            });
            queryClient.invalidateQueries({queryKey: queryKeys.history.combined});

            toast.success('Diary saved successfully!', {
                description: `Diary for ${variables.date} has been recorded.`,
            });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to save diary');
        },
    });
}

export function useUpdateDiary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, ...data}: any) => diaryApi.update(id, data),
        onMutate: async ({date, ...newData}) => {
            await queryClient.cancelQueries({
                queryKey: queryKeys.diary.byDate(date)
            });

            const previousData = queryClient.getQueryData(
                queryKeys.diary.byDate(date)
            );

            queryClient.setQueryData(
                queryKeys.diary.byDate(date),
                (old: any) => ({
                    ...old,
                    data: {...old?.data, ...newData},
                })
            );

            return {previousData, date};
        },
        onError: (err, variables, context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    queryKeys.diary.byDate(context.date),
                    context.previousData
                );
            }
            toast.error('Failed to update diary');
        },
        onSuccess: (data, variables) => {
            toast.success('Diary updated successfully!', {
                description: `Diary for ${variables.date} has been updated.`,
            });
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.diary.byDate(variables.date)
            });
            queryClient.invalidateQueries({queryKey: queryKeys.diary.all});
            queryClient.invalidateQueries({queryKey: queryKeys.history.combined});
        },
    });
}

// Combined History Query
export function useCombinedHistory() {
    return useQuery({
        queryKey: queryKeys.history.combined,
        queryFn: historyApi.getCombined,
        select: (data) => {
            // Transform data into combined entries
            const dateMap = new Map<string, any>();

            data.prayers.forEach((prayer: any) => {
                if (!dateMap.has(prayer.date)) {
                    dateMap.set(prayer.date, {date: prayer.date});
                }
                dateMap.get(prayer.date)!.prayer = prayer;
            });

            data.diaries.forEach((diary: any) => {
                if (!dateMap.has(diary.date)) {
                    dateMap.set(diary.date, {date: diary.date});
                }
                dateMap.get(diary.date)!.diary = diary;
            });

            return Array.from(dateMap.values()).sort((a, b) =>
                b.date.localeCompare(a.date)
            );
        },
    });
}