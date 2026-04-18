import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat';

export function useSendMessage(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    },
  });
}
