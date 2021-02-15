import React, { useMemo } from 'react';
import { useRouter } from '@tarojs/taro';

export type QueryProps = {
  query: Record<string, string>;
}

export function useQuery() {
  const router = useRouter();
  const { params = {} } = router || {};

  const query = useMemo<Record<string, string>>(() => {
    const q = {};
    Object.entries(params).forEach(([key, value]) => {
      q[key] = decodeURIComponent(value ?? '');
    });
    return q;
  }, [params]);

  return query;
}

export function withQuery<PropsType = any>(Component: React.FC<QueryProps>) {
  return function C(props: PropsType) {
    const query = useQuery();

    return (
      <Component query={query} {...props} />
    );
  }
}