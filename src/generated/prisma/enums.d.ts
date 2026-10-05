export declare const UserType: {
    readonly CUSTOMER: "CUSTOMER";
    readonly SELLER: "SELLER";
    readonly PLATFORM_ADMIN: "PLATFORM_ADMIN";
    readonly DELIVERY_AGENT: "DELIVERY_AGENT";
};
export type UserType = (typeof UserType)[keyof typeof UserType];
export declare const UserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly SUSPENDED: "SUSPENDED";
    readonly INACTIVE: "INACTIVE";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
