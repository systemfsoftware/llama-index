import { Document } from 'llamaindex'

export const documents = [
  new Document({
    text:
      'SystemFSoftware specializes in integrating functional programming paradigms with AI development, focusing on creating robust and efficient solutions for natural language processing and machine learning model architectures.',
    metadata: { source: 'company_overview' },
  }),
  new Document({
    text:
      "At SystemFSoftware, we're pioneering the intersection of blockchain and AI technologies, developing innovative decentralized autonomous organizations (DAOs) and trustless AI systems for our clients.",
    metadata: { source: 'product_offerings' },
  }),
  new Document({
    text:
      'Our flagship product at SystemFSoftware is built on Effect, a powerful functional programming library for TypeScript. We leverage this to create scalable, side-effect-free applications with superior testability and robustness.',
    metadata: { source: 'tech_stack' },
  }),
  new Document({
    text:
      'SystemFSoftware is at the forefront of enhancing blockchain smart contracts with AI capabilities. Our solutions enable clients to build more sophisticated and adaptive decentralized applications.',
    metadata: { source: 'innovation' },
  }),
  new Document({
    text:
      "At SystemFSoftware, we're committed to developing explainable and verifiable AI models. By combining functional programming techniques with AI, we address critical concerns about AI transparency and accountability in enterprise solutions.",
    metadata: { source: 'company_values' },
  }),
]
