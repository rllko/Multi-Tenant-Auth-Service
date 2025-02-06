namespace Authentication.Abstracts.Persistence;

public interface IGenericRepository<T> where T : class
{
    Task<T> GetAllAsync();
    Task<T> GetByIdAsync(int id);
    Task<T?> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task<bool> DeleteAsync(int id);
}