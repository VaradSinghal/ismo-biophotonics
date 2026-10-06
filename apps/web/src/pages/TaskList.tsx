import { useState } from 'react';
import { Title, Card, Text, Group, Badge, Stack, Button, ActionIcon, Pagination, TextInput, Modal, Select } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { taskCreateSchema, type TaskUpdateInput, TASK_STATUSES, TASK_PRIORITIES } from '@biophonics/shared';
import { api } from '../api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export function TaskList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: projectsData } = useQuery({
    queryKey: ['projects-all'],
    queryFn: async () => {
      const res = await api.get('/projects', { params: { limit: 100 } });
      return res.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', page, search, projectId],
    queryFn: async () => {
      const res = await api.get('/tasks', { params: { page, search, projectId } });
      return res.data;
    },
  });

  const form = useForm({
    initialValues: { name: '', description: '', projectId: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' },
    validate: zodResolver(taskCreateSchema),
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      if (editingId) {
        return api.put(`/tasks/${editingId}`, values as TaskUpdateInput);
      }
      return api.post('/tasks', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleEdit = (task: any) => {
    setEditingId(task.id);
    form.setValues({
      name: task.name,
      description: task.description || '',
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.split('T')[0] || '',
    });
    open();
  };

  const closeModal = () => {
    close();
    setEditingId(null);
    form.reset();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Tasks</Title>
        <Button leftSection={<Plus size={16} />} onClick={open}>
          New Task
        </Button>
      </Group>

      <Group grow>
        <TextInput
          placeholder="Search tasks..."
          leftSection={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Select
          placeholder="Filter by Project"
          data={projectsData?.data.map((p: any) => ({ value: p.id, label: p.name })) || []}
          value={projectId}
          onChange={setProjectId}
          clearable
        />
      </Group>

      {isLoading ? (
        <Text>Loading tasks...</Text>
      ) : data?.data.length === 0 ? (
        <Text c="dimmed">No tasks found.</Text>
      ) : (
        <Stack gap="md">
          {data?.data.map((task: any) => (
            <Card key={task.id} shadow="sm" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="lg">{task.name}</Text>
                <Group>
                  <Badge color={task.status === 'COMPLETED' ? 'teal' : 'indigo'}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge color={getPriorityColor(task.priority)} variant="outline">
                    {task.priority}
                  </Badge>
                  <ActionIcon variant="subtle" color="gray" onClick={() => handleEdit(task)}>
                    <Edit2 size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => deleteMutation.mutate(task.id)}>
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Text size="sm" c="dimmed" mb="md">{task.description || 'No description'}</Text>
              <Group gap="xl" size="sm">
                <Text><b>Project:</b> {projectsData?.data.find((p: any) => p.id === task.projectId)?.name || 'Unknown'}</Text>
                {task.dueDate && <Text><b>Due:</b> {task.dueDate.split('T')[0]}</Text>}
              </Group>
            </Card>
          ))}
          
          {data?.meta?.pages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination total={data.meta.pages} value={page} onChange={setPage} />
            </Group>
          )}
        </Stack>
      )}

      <Modal opened={opened} onClose={closeModal} title={editingId ? 'Edit Task' : 'New Task'}>
        <form onSubmit={form.onSubmit((v) => saveMutation.mutate(v))}>
          <Stack gap="md">
            <Select 
              label="Project" 
              required 
              data={projectsData?.data.map((p: any) => ({ value: p.id, label: p.name })) || []} 
              {...form.getInputProps('projectId')} 
            />
            <TextInput label="Task Name" required {...form.getInputProps('name')} />
            <TextInput label="Description" {...form.getInputProps('description')} />
            <Select 
              label="Status" 
              data={TASK_STATUSES.map(s => ({ value: s, label: s.replace('_', ' ') }))} 
              {...form.getInputProps('status')} 
            />
            <Select 
              label="Priority" 
              data={TASK_PRIORITIES.map(s => ({ value: s, label: s }))} 
              {...form.getInputProps('priority')} 
            />
            <TextInput label="Due Date" type="date" {...form.getInputProps('dueDate')} />
            <Button type="submit" loading={saveMutation.isPending} mt="md">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
