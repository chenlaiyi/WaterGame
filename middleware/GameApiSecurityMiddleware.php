<?php

namespace App\Http\Middleware\Game;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class GameApiSecurityMiddleware
{
    /**
     * 处理传入请求
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // 1. 检查请求频率限制
        if ($this->shouldRateLimit($request)) {
            if ($this->isRateLimited($request)) {
                return response()->json([
                    'code' => 429,
                    'message' => '请求过于频繁，请稍后再试',
                    'data' => null
                ], 429);
            }
            
            $this->hitRateLimiter($request);
        }
        
        // 2. 检查请求来源
        if (!$this->isValidOrigin($request)) {
            Log::warning('Invalid request origin', [
                'ip' => $request->ip(),
                'origin' => $request->header('Origin'),
                'user_agent' => $request->userAgent()
            ]);
            
            // 可以选择拒绝请求或记录警告
            // return response()->json([
            //     'code' => 403,
            //     'message' => '请求来源不被允许',
            //     'data' => null
            // ], 403);
        }
        
        // 3. 检查User-Agent
        if (!$this->isValidUserAgent($request)) {
            Log::warning('Suspicious User-Agent detected', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        }
        
        // 4. 检查请求内容
        if ($this->containsSuspiciousContent($request)) {
            Log::warning('Suspicious content detected in request', [
                'ip' => $request->ip(),
                'url' => $request->url(),
                'suspicious_content' => $this->getSuspiciousContent($request)
            ]);
            
            // 可以选择拒绝请求
            // return response()->json([
            //     'code' => 400,
            //     'message' => '请求内容包含不被允许的字符',
            //     'data' => null
            // ], 400);
        }
        
        // 5. 记录请求日志
        $this->logRequest($request);
        
        return $next($request);
    }
    
    /**
     * 判断是否应该进行频率限制
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    private function shouldRateLimit(Request $request)
    {
        // 对于某些敏感操作（如创建、更新、删除）进行频率限制
        $sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        $sensitiveRoutes = [
            'api/game/v1/config',
            'api/game/v1/activity'
        ];
        
        return in_array($request->method(), $sensitiveMethods) || 
               $this->startsWithAny($request->path(), $sensitiveRoutes);
    }
    
    /**
     * 检查是否触发频率限制
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    private function isRateLimited(Request $request)
    {
        $key = $this->getRateLimitKey($request);
        $maxAttempts = 60; // 每分钟最多60次请求
        $decayMinutes = 1;
        
        return RateLimiter::tooManyAttempts($key, $maxAttempts);
    }
    
    /**
     * 增加频率限制计数
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    private function hitRateLimiter(Request $request)
    {
        $key = $this->getRateLimitKey($request);
        $decayMinutes = 1;
        
        RateLimiter::hit($key, $decayMinutes);
    }
    
    /**
     * 生成频率限制键
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    private function getRateLimitKey(Request $request)
    {
        return 'game_api:' . $request->ip() . ':' . $request->path();
    }
    
    /**
     * 检查请求来源是否有效
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    private function isValidOrigin(Request $request)
    {
        $origin = $request->header('Origin');
        
        // 如果没有Origin头，允许请求（可能是直接访问）
        if (!$origin) {
            return true;
        }
        
        // 允许的域名列表
        $allowedOrigins = [
            'https://your-domain.com',
            'https://admin.your-domain.com',
            'http://localhost:8080',
            'http://127.0.0.1:8080'
        ];
        
        return in_array($origin, $allowedOrigins);
    }
    
    /**
     * 检查User-Agent是否有效
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    private function isValidUserAgent(Request $request)
    {
        $userAgent = $request->userAgent();
        
        // 如果没有User-Agent，允许请求
        if (!$userAgent) {
            return true;
        }
        
        // 拒绝已知的恶意爬虫User-Agent
        $suspiciousUserAgents = [
            'sqlmap',
            'nikto',
            'nessus',
            'burp',
            'acunetix',
            'netsparker'
        ];
        
        foreach ($suspiciousUserAgents as $suspiciousAgent) {
            if (stripos($userAgent, $suspiciousAgent) !== false) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 检查请求内容是否包含可疑内容
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    private function containsSuspiciousContent(Request $request)
    {
        $suspiciousPatterns = [
            // SQL注入模式
            '/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/i',
            // XSS模式
            '/<script|<\/script|onload=|onerror=|javascript:/i',
            // 文件包含模式
            '/\.\.\/|\.\.\\\|file:\/\/|php:\/\/|data:\/\/|expect:\/\//i',
            // 命令执行模式
            '/\b(system|exec|shell_exec|passthru|popen|proc_open)\b/i'
        ];
        
        // 检查所有请求参数
        $requestData = array_merge(
            $request->all(),
            $request->query(),
            ['url' => $request->path()]
        );
        
        $requestDataString = json_encode($requestData);
        
        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $requestDataString)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 获取可疑内容
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    private function getSuspiciousContent(Request $request)
    {
        $suspiciousPatterns = [
            'sql_injection' => '/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/i',
            'xss' => '/<script|<\/script|onload=|onerror=|javascript:/i',
            'file_inclusion' => '/\.\.\/|\.\.\\\|file:\/\/|php:\/\/|data:\/\/|expect:\/\//i',
            'command_execution' => '/\b(system|exec|shell_exec|passthru|popen|proc_open)\b/i'
        ];
        
        $requestData = array_merge(
            $request->all(),
            $request->query(),
            ['url' => $request->path()]
        );
        
        $requestDataString = json_encode($requestData);
        $foundPatterns = [];
        
        foreach ($suspiciousPatterns as $name => $pattern) {
            if (preg_match($pattern, $requestDataString, $matches)) {
                $foundPatterns[$name] = $matches[0];
            }
        }
        
        return $foundPatterns;
    }
    
    /**
     * 记录请求日志
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    private function logRequest(Request $request)
    {
        // 只记录敏感操作
        $sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (in_array($request->method(), $sensitiveMethods)) {
            Log::info('Game API request', [
                'method' => $request->method(),
                'url' => $request->url(),
                'ip' => $request->ip(),
                'user_id' => auth()->id() ?? 'guest',
                'user_agent' => $request->userAgent(),
                'origin' => $request->header('Origin'),
                'referer' => $request->header('Referer')
            ]);
        }
    }
    
    /**
     * 检查字符串是否以任何给定的前缀开头
     *
     * @param  string  $haystack
     * @param  array  $needles
     * @return bool
     */
    private function startsWithAny($haystack, $needles)
    {
        foreach ($needles as $needle) {
            if (strpos($haystack, $needle) === 0) {
                return true;
            }
        }
        
        return false;
    }
}