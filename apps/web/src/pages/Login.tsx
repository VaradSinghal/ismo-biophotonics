import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Stack } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { loginSchema } from '@biophonics/shared';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useQueryClient } from '@tanstack/react-query';

export function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  });

  const onSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await api.post('/auth/login', values);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by interceptor (shows notification)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" style={{ fontFamily: 'Outfit' }}>
        Welcome to ProjectFlow
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Manage projects, tasks, and stay on top of your schedule.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack>
            <TextInput label="Email" placeholder="you@mantine.dev" required {...form.getInputProps('email')} />
            <PasswordInput label="Password" placeholder="Your password" required {...form.getInputProps('password')} />
            <Button type="submit" fullWidth mt="xl" loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
