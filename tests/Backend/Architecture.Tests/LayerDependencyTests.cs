using NetArchTest.Rules;

namespace Architecture.Tests;

public class LayerDependencyTests
{
    private static readonly System.Reflection.Assembly BackendAssembly = typeof(Backend.Services.IKnowledgeService).Assembly;

    [Fact]
    public void Controllers_Should_Only_Depend_On_Services_And_Dto()
    {
        var result = Types.InAssembly(BackendAssembly)
            .That().ResideInNamespace("Backend.Controllers")
            .ShouldNot().HaveDependencyOnAny(
                "Backend.Repositories",
                "Backend.Persistence",
                "Backend.Domain")
            .GetResult();

        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Services_Should_Not_Depend_On_Controllers_Or_Persistence()
    {
        var result = Types.InAssembly(BackendAssembly)
            .That().ResideInNamespace("Backend.Services")
            .ShouldNot().HaveDependencyOnAny(
                "Backend.Controllers",
                "Backend.Persistence")
            .GetResult();

        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Repositories_Should_Not_Depend_On_Services_Or_Controllers()
    {
        var result = Types.InAssembly(BackendAssembly)
            .That().ResideInNamespace("Backend.Repositories")
            .ShouldNot().HaveDependencyOnAny(
                "Backend.Services",
                "Backend.Controllers",
                "Backend.Dto")
            .GetResult();

        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Domain_Should_Not_Depend_On_Outer_Layers()
    {
        var result = Types.InAssembly(BackendAssembly)
            .That().ResideInNamespace("Backend.Domain")
            .ShouldNot().HaveDependencyOnAny(
                "Backend.Controllers",
                "Backend.Services",
                "Backend.Repositories",
                "Backend.Persistence",
                "Backend.Dto",
                "Backend.Middleware",
                "Microsoft.AspNetCore")
            .GetResult();

        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Dto_Should_Not_Depend_On_Outer_Layers()
    {
        var result = Types.InAssembly(BackendAssembly)
            .That().ResideInNamespace("Backend.Dto")
            .ShouldNot().HaveDependencyOnAny(
                "Backend.Controllers",
                "Backend.Services",
                "Backend.Repositories",
                "Backend.Persistence",
                "Backend.Middleware")
            .GetResult();

        Assert.True(result.IsSuccessful, Format(result));
    }

    private static string Format(TestResult result) =>
        result.FailingTypes is null
            ? "Architecture rule failed."
            : string.Join(", ", result.FailingTypes.Select(t => t.FullName));
}
