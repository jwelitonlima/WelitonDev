import { motion } from "framer-motion";

const skills = [
  { name: "React", level: 90 },
  { name: "TypeScript", level: 85 },
  { name: "Node.js", level: 80 },
  { name: "Tailwind CSS", level: 92 },
  { name: "JavaScript", level: 95 },
  { name: "Git", level: 85 },
  { name: "HTML/CSS", level: 95 },
  { name: "SQL", level: 75 },
];

const Skills = () => {
  return (
    <section id="skills" className="section-padding">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-primary font-mono text-base block mb-2">02.</span>
            Tech Stack
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="space-y-2"
            >
              <div className="flex justify-between font-mono text-sm">
                <span className="text-foreground">{skill.name}</span>
                <span className="text-primary">{skill.level}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(175 80% 50%), hsl(195 80% 60%))",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
