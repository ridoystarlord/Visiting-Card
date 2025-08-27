export interface IOptions {
  page?: number;
  limit?: number;
}

type IOptionsResult = {
  page: number;
  limit: number;
  skip: number;
};

export const calculatePagination = (options: IOptions): IOptionsResult => {
  const page = Number(options?.page || 1);
  const limit = Number(options?.limit || 10);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};
