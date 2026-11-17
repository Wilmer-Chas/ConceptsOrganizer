using Backend.Persistence;
using Backend.Repositories;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<KnowledgeRootOptions>(
    builder.Configuration.GetSection(KnowledgeRootOptions.SectionName));

builder.Services.AddSingleton<IKnowledgePathResolver, KnowledgePathResolver>();
builder.Services.AddScoped<IKnowledgeRepository, KnowledgeRepository>();
builder.Services.AddScoped<IKnowledgeService, KnowledgeService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var paths = scope.ServiceProvider.GetRequiredService<IKnowledgePathResolver>();
    paths.EnsureRootExists();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
app.MapControllers();

app.Run();

public partial class Program;
