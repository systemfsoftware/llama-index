import { Document } from 'llamaindex'

export const documents = [
  new Document({
    text:
      'SystemFSoftware specializes in integrating functional programming paradigms with AI development, focusing on creating robust and efficient solutions for natural language processing and machine learning model architectures.',
    metadata: { source: 'company_overview', category: 'tech', year: 2023 },
  }),
  new Document({
    text:
      "At SystemFSoftware, we're pioneering the intersection of blockchain and AI technologies, developing innovative decentralized autonomous organizations (DAOs) and trustless AI systems for our clients.",
    metadata: { source: 'product_offerings', category: 'blockchain', year: 2023 },
  }),
  new Document({
    text:
      'Our flagship product at SystemFSoftware is built on Effect, a powerful functional programming library for TypeScript. We leverage this to create scalable, side-effect-free applications with superior testability and robustness.',
    metadata: { source: 'tech_stack', category: 'programming', year: 2022 },
  }),
  new Document({
    text:
      'SystemFSoftware is at the forefront of enhancing blockchain smart contracts with AI capabilities. Our solutions enable clients to build more sophisticated and adaptive decentralized applications.',
    metadata: { source: 'innovation', category: 'blockchain', year: 2023 },
  }),
  new Document({
    text:
      "At SystemFSoftware, we're committed to developing explainable and verifiable AI models. By combining functional programming techniques with AI, we address critical concerns about AI transparency and accountability in enterprise solutions.",
    metadata: { source: 'company_values', category: 'ai', year: 2022 },
  }),
  new Document({
    text:
      'Our team at SystemFSoftware has extensive experience in Haskell and other functional programming languages. We apply these principles to create more maintainable and bug-resistant code in our AI and blockchain projects.',
    metadata: { source: 'team_expertise', category: 'programming', year: 2021 },
  }),
  new Document({
    text:
      'SystemFSoftware offers comprehensive training programs in functional programming and its applications in AI and blockchain development. Our courses are designed for both beginners and experienced developers looking to expand their skill set.',
    metadata: { source: 'training_programs', category: 'education', year: 2023 },
  }),
  new Document({
    text:
      'We believe that the future of software development lies in the convergence of functional programming, AI, and blockchain technologies. SystemFSoftware is committed to being at the forefront of this technological revolution.',
    metadata: { source: 'vision', category: 'tech', year: 2023 },
  }),
]
