/**
 * 文档控制器
 */

import { Controller, Get, Param, Res, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery as SwaggerApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentationService } from './documentation.service';
import { DocumentFormat } from './interfaces/doc.interface';
import * as fs from 'fs-extra';
import * as path from 'path';

@ApiTags('Documentation')
@Controller('docs')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Get()
  @ApiOperation({ summary: 'Get documentation index' })
  async getIndex(@Res() res: Response) {
    const indexHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Creatoria SaaS CLI Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
        }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 0.5rem; }
        .doc-list { list-style: none; padding: 0; }
        .doc-list li { 
            margin: 1rem 0; 
            padding: 1rem; 
            background: #f8f9fa; 
            border-radius: 0.25rem;
            border-left: 4px solid #007bff;
        }
        .doc-list a { 
            text-decoration: none; 
            color: #007bff; 
            font-weight: 500;
            font-size: 1.1rem;
        }
        .doc-list a:hover { text-decoration: underline; }
        .description { color: #6c757d; margin-top: 0.5rem; }
        .formats { margin-top: 0.5rem; }
        .format-link { 
            display: inline-block; 
            margin-right: 1rem; 
            padding: 0.25rem 0.5rem;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 0.25rem;
            font-size: 0.9rem;
        }
        .format-link:hover { background: #0056b3; }
    </style>
</head>
<body>
    <h1>📚 Creatoria SaaS CLI Documentation</h1>
    
    <ul class="doc-list">
        <li>
            <a href="/docs/api">API Documentation</a>
            <div class="description">Complete API reference with endpoints, parameters, and responses</div>
            <div class="formats">
                <a class="format-link" href="/docs/api?format=json">JSON</a>
                <a class="format-link" href="/docs/api?format=yaml">YAML</a>
                <a class="format-link" href="/docs/api?format=html">HTML</a>
                <a class="format-link" href="/docs/api?format=markdown">Markdown</a>
                <a class="format-link" href="/docs/api?format=postman">Postman</a>
            </div>
        </li>
        
        <li>
            <a href="/docs/guide/user">User Guide</a>
            <div class="description">Getting started guide and command reference</div>
        </li>
        
        <li>
            <a href="/docs/guide/developer">Developer Guide</a>
            <div class="description">Architecture overview and development guidelines</div>
        </li>
        
        <li>
            <a href="/docs/reference/config">Configuration Reference</a>
            <div class="description">Complete configuration options and examples</div>
        </li>
        
        <li>
            <a href="/api-docs">Swagger UI</a>
            <div class="description">Interactive API documentation with testing capabilities</div>
        </li>
    </ul>
    
    <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #dee2e6; color: #6c757d; text-align: center;">
        Generated with Creatoria SaaS CLI Documentation System
    </footer>
</body>
</html>
    `;
    
    res.type('html').send(indexHtml);
  }

  @Get('api')
  @ApiOperation({ summary: 'Get API documentation' })
  @SwaggerApiQuery({ 
    name: 'format', 
    required: false, 
    enum: Object.values(DocumentFormat),
    description: 'Output format'
  })
  async getApiDocumentation(
    @Query('format') format: DocumentFormat = DocumentFormat.HTML,
    @Res() res: Response,
  ) {
    const filePath = await this.documentationService.exportDocumentation(format);
    const content = await fs.readFile(filePath, 'utf-8');
    
    let contentType: string;
    switch (format) {
      case DocumentFormat.JSON:
      case DocumentFormat.POSTMAN:
      case DocumentFormat.OPENAPI:
        contentType = 'application/json';
        break;
      case DocumentFormat.YAML:
        contentType = 'application/x-yaml';
        break;
      case DocumentFormat.HTML:
        contentType = 'text/html';
        break;
      case DocumentFormat.MARKDOWN:
        contentType = 'text/markdown';
        break;
      default:
        contentType = 'text/plain';
    }
    
    res.type(contentType).send(content);
  }

  @Get('guide/:type')
  @ApiOperation({ summary: 'Get guide documentation' })
  @ApiParam({ name: 'type', enum: ['user', 'developer'] })
  async getGuide(
    @Param('type') type: 'user' | 'developer',
    @Res() res: Response,
  ) {
    const guidePath = path.join(
      process.cwd(),
      'docs',
      'guides',
      `${type}-guide.md`,
    );
    
    if (!await fs.pathExists(guidePath)) {
      // Generate if not exists
      await this.documentationService.generateAllDocumentation();
    }
    
    const content = await fs.readFile(guidePath, 'utf-8');
    const marked = require('marked');
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${type === 'user' ? 'User' : 'Developer'} Guide</title>
    <link href="https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <style>
        body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
        }
        @media (max-width: 767px) {
            body { padding: 15px; }
        }
    </style>
</head>
<body>
    <article class="markdown-body">
        ${marked.parse(content)}
    </article>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-bash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-typescript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-json.min.js"></script>
</body>
</html>
    `;
    
    res.type('html').send(html);
  }

  @Get('reference/:type')
  @ApiOperation({ summary: 'Get reference documentation' })
  @ApiParam({ name: 'type', enum: ['config'] })
  async getReference(
    @Param('type') type: 'config',
    @Res() res: Response,
  ) {
    const referencePath = path.join(
      process.cwd(),
      'docs',
      'references',
      `${type}-reference.md`,
    );
    
    if (!await fs.pathExists(referencePath)) {
      // Generate if not exists
      await this.documentationService.generateAllDocumentation();
    }
    
    const content = await fs.readFile(referencePath, 'utf-8');
    const marked = require('marked');
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Configuration Reference</title>
    <link href="https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.min.css" rel="stylesheet">
    <style>
        body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
        }
        .markdown-body table {
            display: table;
            width: 100%;
            overflow: auto;
        }
        @media (max-width: 767px) {
            body { padding: 15px; }
        }
    </style>
</head>
<body>
    <article class="markdown-body">
        ${marked.parse(content)}
    </article>
</body>
</html>
    `;
    
    res.type('html').send(html);
  }

  @Get('generate')
  @ApiOperation({ summary: 'Generate all documentation' })
  async generateDocumentation() {
    await this.documentationService.generateAllDocumentation();
    return {
      success: true,
      message: 'Documentation generated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('download/:format')
  @ApiOperation({ summary: 'Download documentation archive' })
  @ApiParam({ name: 'format', enum: ['zip', 'tar'] })
  async downloadDocumentation(
    @Param('format') format: 'zip' | 'tar',
    @Res() res: Response,
  ) {
    const archiver = require('archiver');
    const docsPath = path.join(process.cwd(), 'docs');
    
    // Ensure documentation is generated
    if (!await fs.pathExists(docsPath)) {
      await this.documentationService.generateAllDocumentation();
    }
    
    const archive = archiver(format, {
      zlib: { level: 9 },
    });
    
    const filename = `creatoria-docs-${Date.now()}.${format}`;
    
    res.attachment(filename);
    archive.pipe(res);
    
    archive.directory(docsPath, false);
    archive.finalize();
  }
}