'use client';
import { useState, useEffect, useCallback } from 'react';
import { policyPagesApi, PolicyPageDto } from '@/lib/api';

export function usePolicyPage(slug: string, fallbackData?: PolicyPageDto) {
  const [page, setPage] = useState<PolicyPageDto | null>(fallbackData || null);
  const [loading, setLoading] = useState(!fallbackData);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    try {
      const res = await policyPagesApi.getBySlug(slug);
      setPage(res.data);
      setError(null);
    } catch (err: unknown) {
      console.error(`Error loading policy page '${slug}':`, err);
      if (!fallbackData) {
        setError('Failed to load content');
      }
    } finally {
      setLoading(false);
    }
  }, [slug, fallbackData]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const updateField = async (path: string, value: string) => {
    const res = await policyPagesApi.updateField(slug, path, value);
    setPage(res.data);
  };

  const addSection = async (data: {
    title: string;
    body: string;
    highlightTitle?: string;
    highlightText?: string;
  }) => {
    const res = await policyPagesApi.addSection(slug, data);
    setPage(res.data);
  };

  const deleteSection = async (sectionId: string) => {
    const res = await policyPagesApi.deleteSection(slug, sectionId);
    setPage(res.data);
  };

  const updateFullPage = async (updated: PolicyPageDto) => {
    const res = await policyPagesApi.update(slug, updated);
    setPage(res.data);
  };

  return {
    page,
    loading,
    error,
    refresh: fetchPage,
    updateField,
    addSection,
    deleteSection,
    updateFullPage,
  };
}
