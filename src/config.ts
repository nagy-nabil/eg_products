import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
    WSENDPOINT: z.string().url().nonempty(),
});

export type EnvT = z.infer<typeof envSchema>;

/**
 * check for all required env vars, and return type safe process.env
 * @returns
 */
export function initENV(): EnvT {
    const parsed = envSchema.parse(process.env);

    return parsed;
}

export const env = initENV();
