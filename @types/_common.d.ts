declare module '_common' {
  import { GetStaticPathsResult, GetStaticPropsResult } from 'next';

  type ErrorMessage = {
    message: string;
  };

  type ResultError<D = null> = {
    type: 'error';
    error: ErrorMessage;
    data: D | null;
  };

  type ResultSuccess<D> = {
    type: 'success';
    error: null;
    data: D;
  };

  type ResultPending<D = null> = {
    type: 'pending';
    error: null;
    data: D | null;
  };

  type StaticPropsError = GetStaticPropsResult<ResultError>;

  type StaticPropsSuccess<Data> = GetStaticPropsResult<ResultSuccess<Data>>;
  type StaticPathError = GetStaticPathsResult<any>;

  type Meta = Record<string, any> | null;
  type Result<D> = ResultError<D> | ResultSuccess<D> | ResultPending<D>;

  type ValidQuery<Query> = {
    status: 'valid';
    query: Query;
  };

  type InvalidQuery = {
    status: 'invalid';
    query: null;
  };
}
