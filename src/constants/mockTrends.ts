import { CategoryInfoMap } from '@/types/trend';

export const CATEGORY_INFO: CategoryInfoMap = {
  frontend: {
    name: 'Frontend',
    color: '#1C89AD',
    nodes: [
      { id: 'Frontend', group: 1 },
      { id: 'React', group: 2 }, { id: 'Next.js', group: 2 }, { id: 'Vue', group: 2 },
      { id: 'Tailwind', group: 3 }, { id: 'TypeScript', group: 3 }, { id: 'Three.js', group: 3 },
      { id: 'Redux', group: 3 }, { id: 'Zustand', group: 3 }, { id: 'SWR', group: 3 }
    ],
    links: [
      { source: 'Frontend', target: 'React' }, { source: 'Frontend', target: 'Next.js' },
      { source: 'Frontend', target: 'Vue' }, { source: 'React', target: 'Next.js' },
      { source: 'React', target: 'TypeScript' }, { source: 'Next.js', target: 'Tailwind' },
      { source: 'React', target: 'Redux' }, { source: 'React', target: 'Zustand' }
    ]
  },
  backend: {
    name: 'Backend',
    color: '#4CAF50',
    nodes: [
      { id: 'Backend', group: 1 },
      { id: 'Spring Boot', group: 2 }, { id: 'Node.js', group: 2 }, { id: 'Go', group: 2 },
      { id: 'PostgreSQL', group: 3 }, { id: 'Redis', group: 3 }, { id: 'Kafka', group: 3 },
      { id: 'Docker', group: 3 }, { id: 'GraphQL', group: 3 }, { id: 'gRPC', group: 3 }
    ],
    links: [
      { source: 'Backend', target: 'Spring Boot' }, { source: 'Backend', target: 'Node.js' },
      { source: 'Backend', target: 'Go' }, { source: 'Spring Boot', target: 'PostgreSQL' },
      { source: 'Node.js', target: 'Redis' }, { source: 'Go', target: 'Kafka' },
      { source: 'Backend', target: 'GraphQL' }, { source: 'Go', target: 'gRPC' }
    ]
  },
  'ai-data': {
    name: 'AI & Data',
    color: '#FF9800',
    nodes: [
      { id: 'AI & Data', group: 1 },
      { id: 'PyTorch', group: 2 }, { id: 'LLM', group: 2 }, { id: 'MLOps', group: 2 },
      { id: 'LangChain', group: 3 }, { id: 'HuggingFace', group: 3 }, { id: 'Vector DB', group: 3 },
      { id: 'TensorFlow', group: 3 }, { id: 'Pandas', group: 3 }, { id: 'Spark', group: 3 }
    ],
    links: [
      { source: 'AI & Data', target: 'PyTorch' }, { source: 'AI & Data', target: 'LLM' },
      { source: 'LLM', target: 'LangChain' }, { source: 'LLM', target: 'Vector DB' },
      { source: 'PyTorch', target: 'HuggingFace' }, { source: 'LLM', target: 'MLOps' },
      { source: 'AI & Data', target: 'Spark' }
    ]
  },
  devops: {
    name: 'DevOps',
    color: '#2496ED',
    nodes: [
      { id: 'DevOps', group: 1 },
      { id: 'Docker', group: 2 }, { id: 'Kubernetes', group: 2 }, { id: 'Terraform', group: 2 },
      { id: 'GitHub Actions', group: 3 }, { id: 'Prometheus', group: 3 }, { id: 'AWS', group: 3 },
      { id: 'Grafana', group: 3 }, { id: 'Ansible', group: 3 }, { id: 'ArgoCD', group: 3 }
    ],
    links: [
      { source: 'DevOps', target: 'Docker' }, { source: 'Docker', target: 'Kubernetes' },
      { source: 'DevOps', target: 'Terraform' }, { source: 'Kubernetes', target: 'Prometheus' },
      { source: 'DevOps', target: 'GitHub Actions' }, { source: 'Terraform', target: 'AWS' },
      { source: 'Prometheus', target: 'Grafana' }, { source: 'Kubernetes', target: 'ArgoCD' }
    ]
  },
  embedding: {
    name: 'Embedded',
    color: '#FFEB3B',
    nodes: [
      { id: 'Embedded', group: 1 },
      { id: 'C/C++', group: 2 }, { id: 'RTOS', group: 2 }, { id: 'Firmware', group: 2 },
      { id: 'Raspberry Pi', group: 3 }, { id: 'ESP32', group: 3 }, { id: 'Edge AI', group: 3 },
      { id: 'Arduino', group: 3 }, { id: 'FreeRTOS', group: 3 }, { id: 'ARM', group: 3 }
    ],
    links: [
      { source: 'Embedded', target: 'C/C++' }, { source: 'Embedded', target: 'RTOS' },
      { source: 'C/C++', target: 'Firmware' }, { source: 'RTOS', target: 'ESP32' },
      { source: 'Embedded', target: 'Raspberry Pi' }, { source: 'Firmware', target: 'Edge AI' },
      { source: 'RTOS', target: 'FreeRTOS' }
    ]
  },
  game: {
    name: 'Game Dev',
    color: '#E91E63',
    nodes: [
      { id: 'Game Dev', group: 1 },
      { id: 'Unreal Engine', group: 2 }, { id: 'Unity', group: 2 }, { id: 'Godot', group: 2 },
      { id: 'C#', group: 3 }, { id: 'C++', group: 3 }, { id: 'Shaders', group: 3 },
      { id: 'DirectX', group: 3 }, { id: 'Vulkan', group: 3 }, { id: 'Blender', group: 3 }
    ],
    links: [
      { source: 'Game Dev', target: 'Unreal Engine' }, { source: 'Game Dev', target: 'Unity' },
      { source: 'Unity', target: 'C#' }, { source: 'Unreal Engine', target: 'C++' },
      { source: 'Unreal Engine', target: 'Shaders' }, { source: 'Game Dev', target: 'Godot' },
      { source: 'Shaders', target: 'Vulkan' }
    ]
  },
  security: {
    name: 'Security',
    color: '#9C27B0',
    nodes: [
      { id: 'Security', group: 1 },
      { id: 'Pentesting', group: 2 }, { id: 'Cryptography', group: 2 }, { id: 'Zero Trust', group: 2 },
      { id: 'Kali Linux', group: 3 }, { id: 'OAuth2', group: 3 }, { id: 'SIEM', group: 3 },
      { id: 'Wireshark', group: 3 }, { id: 'Burp Suite', group: 3 }, { id: 'Metasploit', group: 3 }
    ],
    links: [
      { source: 'Security', target: 'Pentesting' }, { source: 'Security', target: 'Cryptography' },
      { source: 'Pentesting', target: 'Kali Linux' }, { source: 'Security', target: 'Zero Trust' },
      { source: 'Zero Trust', target: 'OAuth2' }, { source: 'Security', target: 'SIEM' },
      { source: 'Pentesting', target: 'Burp Suite' }
    ]
  },
};