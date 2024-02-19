/* Autogenerated file. Do not edit manually. */

import { Account, AccountInterface } from "starknet";
import { DojoProvider } from "@dojoengine/core";
import { Direction } from "../../utils";

export type IWorld = Awaited<ReturnType<typeof setupWorld>>;

export interface MoveProps {
    account: Account | AccountInterface;
    direction: Direction;
}

export async function setupWorld(provider: DojoProvider) {
    function actions() {
        const contract_name = "actions";

        const spawn = async ({ account }: { account: Account }) => {
            try {
                return await provider.execute(
                    account,
                    contract_name,
                    "spawn",
                    []
                );
            } catch (error) {
                console.error("Error executing spawn:", error);
                throw error;
            }
        };

        const move = async ({ account, direction }: MoveProps) => {
            try {
                return await provider.execute(account, contract_name, "move", [
                    direction,
                ]);
            } catch (error) {
                console.error("Error executing move:", error);
                throw error;
            }
        };
        return { spawn, move };
    }
    return {
        actions: actions(),
    };
}
