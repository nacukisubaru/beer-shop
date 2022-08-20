const limitPage = 5;

export const paginate = (query: object, page: number, pageSize: number = limitPage) => {
    let limit = pageSize;
    if(!pageSize) {
        limit = limitPage;
    }
    const offset = page * limit;

    return {
        ...query,
        offset,
        limit,
    };
};