import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { DeepInferCost } from "@/components/tools/deepinfer-cost";

export const metadata: Metadata = {
  title: "DeepInfer 成本对比",
  description:
    "DeepSeek 开源推理框架 DeepInfer 自托管 vs 官方 API 成本对比计算器，估算不同 token 量级下哪种方案更省钱。",
  keywords: ["DeepInfer", "DeepSeek", "推理框架", "自托管成本", "vLLM", "GPU 成本"],
};

export default function Page() {
  return (
    <ToolShell slug="deepinfer-cost">
      <DeepInferCost />
      <section className="mx-auto mt-10 max-w-2xl space-y-3 text-sm leading-relaxed text-stone-500">
        <h2 className="text-sm font-semibold text-stone-800">关于 DeepInfer</h2>
        <p>
          DeepInfer 是 DeepSeek 于 2026 年 10 月 20 日开源的高性能推理框架（Apache
          2.0），即驱动 DeepSeek-V4.1-Flash 大规模生产服务的那套引擎，基于 vLLM
          深度改造，包含 FlashMLA / DeepGEMM / DeepEP 优化内核、DSpark
          投机解码、批量不变推理与确定性采样、结构化输出等能力，官方宣称单集群日处理
          155 万亿 tokens。
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            目前仅支持 <b className="text-stone-700">DeepSeek-V4.1-Flash</b> 一个模型，硬件仅支持
            NVIDIA SM100（Blackwell）与华为昇腾 950，仅覆盖离线批量推理。
          </li>
          <li>
            完整在线服务所需的 KV Cache 管理、Prefill/Decode 分离与负载均衡未包含在本此开源中。
          </li>
          <li>
            官方基准（4 卡 prefill / 64 卡 decode）为自测数据，尚无第三方复现，选型时建议自行压测。
          </li>
        </ul>
        <p>
          源码：
          <a
            href="https://github.com/deepseek-ai/DeepInfer"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            github.com/deepseek-ai/DeepInfer
          </a>
          。本工具为独立估算模型，与 DeepSeek 官方无关。
        </p>
      </section>
    </ToolShell>
  );
}
