<?php

namespace App\Http\Controllers\Game\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameConfigController extends Controller
{
    /**
     * 获取游戏配置列表
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('game_configs');
            
            // 搜索功能
            if ($request->has('search') && $request->search) {
                $query->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
            }
            
            // 状态筛选
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }
            
            $configs = $query->orderBy('created_at', 'desc')
                             ->paginate($request->get('per_page', 15));
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $configs
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 创建游戏配置
     */
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:100',
                'type' => 'required|string|max:50',
                'value' => 'required',
                'description' => 'nullable|string|max:255',
                'status' => 'boolean'
            ]);
            
            $data['created_at'] = now();
            $data['updated_at'] = now();
            
            $id = DB::table('game_configs')->insertGetId($data);
            
            return response()->json([
                'code' => 200,
                'message' => '创建成功',
                'data' => ['id' => $id]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '创建失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取单个游戏配置
     */
    public function show($id)
    {
        try {
            $config = DB::table('game_configs')->where('id', $id)->first();
            
            if (!$config) {
                return response()->json([
                    'code' => 404,
                    'message' => '配置不存在'
                ]);
            }
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $config
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 更新游戏配置
     */
    public function update(Request $request, $id)
    {
        try {
            $config = DB::table('game_configs')->where('id', $id)->first();
            
            if (!$config) {
                return response()->json([
                    'code' => 404,
                    'message' => '配置不存在'
                ]);
            }
            
            $data = $request->validate([
                'name' => 'string|max:100',
                'type' => 'string|max:50',
                'value' => 'string',
                'description' => 'nullable|string|max:255',
                'status' => 'boolean'
            ]);
            
            $data['updated_at'] = now();
            
            DB::table('game_configs')->where('id', $id)->update($data);
            
            return response()->json([
                'code' => 200,
                'message' => '更新成功'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '更新失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 删除游戏配置
     */
    public function destroy($id)
    {
        try {
            $config = DB::table('game_configs')->where('id', $id)->first();
            
            if (!$config) {
                return response()->json([
                    'code' => 404,
                    'message' => '配置不存在'
                ]);
            }
            
            DB::table('game_configs')->where('id', $id)->delete();
            
            return response()->json([
                'code' => 200,
                'message' => '删除成功'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '删除失败：' . $e->getMessage()
            ]);
        }
    }
}