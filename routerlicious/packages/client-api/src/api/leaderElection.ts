import { IPendingProposal, IQuorum } from "@prague/runtime-definitions";
import { EventEmitter } from "events";
import { debug } from "./debug";

export const QuorumKey = "leader";

export class LeaderElector extends EventEmitter {

    private leader: string;
    constructor(private quorum: IQuorum, private clientId: string) {
        super();
        this.attachQuorumListeners();
    }

    public async proposeLeadership() {
        return this.quorum.propose(QuorumKey, this.clientId);
    }

    private attachQuorumListeners() {
        this.quorum.on("approveProposal", (sequenceNumber: number, key: string, value: any) => {
            if (key === QuorumKey) {
                this.leader = value as string;
                this.emit(QuorumKey, this.leader);
            }
        });
        this.quorum.on("addProposal", (proposal: IPendingProposal) => {
            if (proposal.key === QuorumKey) {
                if (this.leader !== undefined) {
                    proposal.reject();
                }
            }
        });

        this.quorum.on("removeMember", (removedClientId: string) => {
            if (this.leader === undefined || removedClientId === this.leader) {
                debug(`${removedClientId} Left! Proposing new leadership.`);
                this.leader = undefined;
                this.quorum.propose(QuorumKey, this.clientId).then(() => {
                    debug(`Proposal accepted: ${this.clientId}!`);
                }, (err) => {
                    debug(`Error proposing new leadership: ${err}`);
                });
            }
        });

        this.quorum.on("rejectProposal", (sequenceNumber: number, key: string, value: any) => {
            debug(`Proposal rejected @${sequenceNumber}. ${key}:${value}`);
        });
    }
}
