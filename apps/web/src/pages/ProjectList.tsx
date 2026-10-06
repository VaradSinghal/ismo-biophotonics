import { useState } from 'react';
import { Title, Card, Text, Group, Badge, Stack, Button, ActionIcon, Pagination, TextInput, Modal, Select } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { projectCreateSchema, type ProjectUpdateInput, PROJECT_STATUSES } from '@biophonics/shared';
import { api } from '../api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export function ProjectList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', page, search],
    queryFn: async () => {
      const res = await api.get('/projects', { params: { page, search } });
      return res.data;
    },
  });

  const form = useForm({
    initialValues: { name: '', description: '', status: 'NOT_STARTED', startDate: '', endDate: '' },
    validate: zodResolver(projectCreateSchema),
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      if (editingId) {
        return api.put(`/projects/${editingId}`, values as ProjectUpdateInput);
      }
      return api.post('/projects', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    form.setValues({
      name: project.name,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate?.split('T')[0] || '',
      endDate: project.endDate?.split('T')[0] || '',
    });
    open();
  };

  const closeModal = () => {
    close();
    setEditingId(null);
    form.reset();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'teal';
      case 'IN_PROGRESS': return 'indigo';
      default: return 'gray';
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Projects</Title>
        <Button leftSection={<Plus size={16} />} onClick={open}>
          New Project
        </Button>
      </Group>

      <TextInput
        placeholder="Search projects..."
        leftSection={<Search size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      {isLoading ? (
        <Text>Loading projects...</Text>
      ) : data?.data.length === 0 ? (
        <Text c="dimmed">No projects found. Create one to get started!</Text>
      ) : (
        <Stack gap="md">
          {data?.data.map((project: any) => (
            <Card key={project.id} shadow="sm" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="lg">{project.name}</Text>
                <Group>
                  <Badge color={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                  <ActionIcon variant="subtle" color="gray" onClick={() => handleEdit(project)}>
                    <Edit2 size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => deleteMutation.mutate(project.id)}>
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Text size="sm" c="dimmed" mb="md">{project.description || 'No description'}</Text>
              <Group gap="xl" size="sm">
                <Text><b>Completed Tasks:</b> {project.completedTaskCount}</Text>
                {project.startDate && <Text><b>Start:</b> {project.startDate.split('T')[0]}</Text>}
                {project.endDate && <Text><b>End:</b> {project.endDate.split('T')[0]}</Text>}
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

      <Modal opened={opened} onClose={closeModal} title={editingId ? 'Edit Project' : 'New Project'}>
        <form onSubmit={form.onSubmit((v) => saveMutation.mutate(v))}>
          <Stack gap="md">
            <TextInput label="Project Name" required {...form.getInputProps('name')} />
            <TextInput label="Description" {...form.getInputProps('description')} />
            <Select 
              label="Status" 
              data={PROJECT_STATUSES.map(s => ({ value: s, label: s.replace('_', ' ') }))} 
              {...form.getInputProps('status')} 
            />
            <TextInput label="Start Date" type="date" {...form.getInputProps('startDate')} />
            <TextInput label="End Date" type="date" {...form.getInputProps('endDate')} />
            <Button type="submit" loading={saveMutation.isPending} mt="md">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
