const limitPage = 5;

export const paginate = (query: object, page: number, pageSize: number = limitPage) => {
    const offset = page * pageSize;
    const limit = pageSize;

    return {
        ...query,
        offset,
        limit,
    };
};