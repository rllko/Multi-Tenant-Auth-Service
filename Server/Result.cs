namespace Authentication;

public readonly struct Result<TValue, TError>
{
    public bool IsError { get; }
    public bool IsSuccess => !IsError;

    private readonly TValue? _value;
    private readonly TError? _error;

    public Result(TValue value)
    {
        IsError = false;
        _value = value;
        _error = default;
    }

    public Result(TError error)
    {
        IsError = true;
        _error = error;
        _value = default;
    }

    public static implicit operator Result<TValue, TError>(TValue value)
    {
        return new Result<TValue, TError>(value);
    }

    public static implicit operator Result<TValue, TError>(TError error)
    {
        return new Result<TValue, TError>(error);
    }

    public TResult Match<TResult>(Func<TValue, TResult> success, Func<TError, TResult> failure)
    {
        return !IsError ? success(_value!) : failure(_error!);
    }
}