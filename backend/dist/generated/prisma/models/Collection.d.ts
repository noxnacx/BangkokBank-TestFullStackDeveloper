import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CollectionModel = runtime.Types.Result.DefaultSelection<Prisma.$CollectionPayload>;
export type AggregateCollection = {
    _count: CollectionCountAggregateOutputType | null;
    _min: CollectionMinAggregateOutputType | null;
    _max: CollectionMaxAggregateOutputType | null;
};
export type CollectionMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    ownerId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CollectionMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    ownerId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CollectionCountAggregateOutputType = {
    id: number;
    name: number;
    ownerId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type CollectionMinAggregateInputType = {
    id?: true;
    name?: true;
    ownerId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CollectionMaxAggregateInputType = {
    id?: true;
    name?: true;
    ownerId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CollectionCountAggregateInputType = {
    id?: true;
    name?: true;
    ownerId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type CollectionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CollectionWhereInput;
    orderBy?: Prisma.CollectionOrderByWithRelationInput | Prisma.CollectionOrderByWithRelationInput[];
    cursor?: Prisma.CollectionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CollectionCountAggregateInputType;
    _min?: CollectionMinAggregateInputType;
    _max?: CollectionMaxAggregateInputType;
};
export type GetCollectionAggregateType<T extends CollectionAggregateArgs> = {
    [P in keyof T & keyof AggregateCollection]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCollection[P]> : Prisma.GetScalarType<T[P], AggregateCollection[P]>;
};
export type CollectionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CollectionWhereInput;
    orderBy?: Prisma.CollectionOrderByWithAggregationInput | Prisma.CollectionOrderByWithAggregationInput[];
    by: Prisma.CollectionScalarFieldEnum[] | Prisma.CollectionScalarFieldEnum;
    having?: Prisma.CollectionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CollectionCountAggregateInputType | true;
    _min?: CollectionMinAggregateInputType;
    _max?: CollectionMaxAggregateInputType;
};
export type CollectionGroupByOutputType = {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: CollectionCountAggregateOutputType | null;
    _min: CollectionMinAggregateOutputType | null;
    _max: CollectionMaxAggregateOutputType | null;
};
export type GetCollectionGroupByPayload<T extends CollectionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CollectionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CollectionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CollectionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CollectionGroupByOutputType[P]>;
}>>;
export type CollectionWhereInput = {
    AND?: Prisma.CollectionWhereInput | Prisma.CollectionWhereInput[];
    OR?: Prisma.CollectionWhereInput[];
    NOT?: Prisma.CollectionWhereInput | Prisma.CollectionWhereInput[];
    id?: Prisma.StringFilter<"Collection"> | string;
    name?: Prisma.StringFilter<"Collection"> | string;
    ownerId?: Prisma.StringFilter<"Collection"> | string;
    createdAt?: Prisma.DateTimeFilter<"Collection"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Collection"> | Date | string;
    bookmarks?: Prisma.BookmarkListRelationFilter;
};
export type CollectionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    ownerId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    bookmarks?: Prisma.BookmarkOrderByRelationAggregateInput;
};
export type CollectionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CollectionWhereInput | Prisma.CollectionWhereInput[];
    OR?: Prisma.CollectionWhereInput[];
    NOT?: Prisma.CollectionWhereInput | Prisma.CollectionWhereInput[];
    name?: Prisma.StringFilter<"Collection"> | string;
    ownerId?: Prisma.StringFilter<"Collection"> | string;
    createdAt?: Prisma.DateTimeFilter<"Collection"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Collection"> | Date | string;
    bookmarks?: Prisma.BookmarkListRelationFilter;
}, "id">;
export type CollectionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    ownerId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.CollectionCountOrderByAggregateInput;
    _max?: Prisma.CollectionMaxOrderByAggregateInput;
    _min?: Prisma.CollectionMinOrderByAggregateInput;
};
export type CollectionScalarWhereWithAggregatesInput = {
    AND?: Prisma.CollectionScalarWhereWithAggregatesInput | Prisma.CollectionScalarWhereWithAggregatesInput[];
    OR?: Prisma.CollectionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CollectionScalarWhereWithAggregatesInput | Prisma.CollectionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Collection"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Collection"> | string;
    ownerId?: Prisma.StringWithAggregatesFilter<"Collection"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Collection"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Collection"> | Date | string;
};
export type CollectionCreateInput = {
    id?: string;
    name: string;
    ownerId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bookmarks?: Prisma.BookmarkCreateNestedManyWithoutCollectionInput;
};
export type CollectionUncheckedCreateInput = {
    id?: string;
    name: string;
    ownerId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bookmarks?: Prisma.BookmarkUncheckedCreateNestedManyWithoutCollectionInput;
};
export type CollectionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bookmarks?: Prisma.BookmarkUpdateManyWithoutCollectionNestedInput;
};
export type CollectionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bookmarks?: Prisma.BookmarkUncheckedUpdateManyWithoutCollectionNestedInput;
};
export type CollectionCreateManyInput = {
    id?: string;
    name: string;
    ownerId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CollectionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CollectionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CollectionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    ownerId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CollectionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    ownerId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CollectionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    ownerId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CollectionNullableScalarRelationFilter = {
    is?: Prisma.CollectionWhereInput | null;
    isNot?: Prisma.CollectionWhereInput | null;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type CollectionCreateNestedOneWithoutBookmarksInput = {
    create?: Prisma.XOR<Prisma.CollectionCreateWithoutBookmarksInput, Prisma.CollectionUncheckedCreateWithoutBookmarksInput>;
    connectOrCreate?: Prisma.CollectionCreateOrConnectWithoutBookmarksInput;
    connect?: Prisma.CollectionWhereUniqueInput;
};
export type CollectionUpdateOneWithoutBookmarksNestedInput = {
    create?: Prisma.XOR<Prisma.CollectionCreateWithoutBookmarksInput, Prisma.CollectionUncheckedCreateWithoutBookmarksInput>;
    connectOrCreate?: Prisma.CollectionCreateOrConnectWithoutBookmarksInput;
    upsert?: Prisma.CollectionUpsertWithoutBookmarksInput;
    disconnect?: Prisma.CollectionWhereInput | boolean;
    delete?: Prisma.CollectionWhereInput | boolean;
    connect?: Prisma.CollectionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CollectionUpdateToOneWithWhereWithoutBookmarksInput, Prisma.CollectionUpdateWithoutBookmarksInput>, Prisma.CollectionUncheckedUpdateWithoutBookmarksInput>;
};
export type CollectionCreateWithoutBookmarksInput = {
    id?: string;
    name: string;
    ownerId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CollectionUncheckedCreateWithoutBookmarksInput = {
    id?: string;
    name: string;
    ownerId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CollectionCreateOrConnectWithoutBookmarksInput = {
    where: Prisma.CollectionWhereUniqueInput;
    create: Prisma.XOR<Prisma.CollectionCreateWithoutBookmarksInput, Prisma.CollectionUncheckedCreateWithoutBookmarksInput>;
};
export type CollectionUpsertWithoutBookmarksInput = {
    update: Prisma.XOR<Prisma.CollectionUpdateWithoutBookmarksInput, Prisma.CollectionUncheckedUpdateWithoutBookmarksInput>;
    create: Prisma.XOR<Prisma.CollectionCreateWithoutBookmarksInput, Prisma.CollectionUncheckedCreateWithoutBookmarksInput>;
    where?: Prisma.CollectionWhereInput;
};
export type CollectionUpdateToOneWithWhereWithoutBookmarksInput = {
    where?: Prisma.CollectionWhereInput;
    data: Prisma.XOR<Prisma.CollectionUpdateWithoutBookmarksInput, Prisma.CollectionUncheckedUpdateWithoutBookmarksInput>;
};
export type CollectionUpdateWithoutBookmarksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CollectionUncheckedUpdateWithoutBookmarksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CollectionCountOutputType = {
    bookmarks: number;
};
export type CollectionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bookmarks?: boolean | CollectionCountOutputTypeCountBookmarksArgs;
};
export type CollectionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionCountOutputTypeSelect<ExtArgs> | null;
};
export type CollectionCountOutputTypeCountBookmarksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BookmarkWhereInput;
};
export type CollectionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    ownerId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    bookmarks?: boolean | Prisma.Collection$bookmarksArgs<ExtArgs>;
    _count?: boolean | Prisma.CollectionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["collection"]>;
export type CollectionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    ownerId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["collection"]>;
export type CollectionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    ownerId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["collection"]>;
export type CollectionSelectScalar = {
    id?: boolean;
    name?: boolean;
    ownerId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type CollectionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "ownerId" | "createdAt" | "updatedAt", ExtArgs["result"]["collection"]>;
export type CollectionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bookmarks?: boolean | Prisma.Collection$bookmarksArgs<ExtArgs>;
    _count?: boolean | Prisma.CollectionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type CollectionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type CollectionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $CollectionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Collection";
    objects: {
        bookmarks: Prisma.$BookmarkPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["collection"]>;
    composites: {};
};
export type CollectionGetPayload<S extends boolean | null | undefined | CollectionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CollectionPayload, S>;
export type CollectionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CollectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CollectionCountAggregateInputType | true;
};
export interface CollectionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Collection'];
        meta: {
            name: 'Collection';
        };
    };
    findUnique<T extends CollectionFindUniqueArgs>(args: Prisma.SelectSubset<T, CollectionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CollectionClient<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CollectionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CollectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CollectionClient<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CollectionFindFirstArgs>(args?: Prisma.SelectSubset<T, CollectionFindFirstArgs<ExtArgs>>): Prisma.Prisma__CollectionClient<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CollectionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CollectionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CollectionClient<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CollectionFindManyArgs>(args?: Prisma.SelectSubset<T, CollectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CollectionCreateArgs>(args: Prisma.SelectSubset<T, CollectionCreateArgs<ExtArgs>>): Prisma.Prisma__CollectionClient<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CollectionCreateManyArgs>(args?: Prisma.SelectSubset<T, CollectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CollectionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CollectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CollectionDeleteArgs>(args: Prisma.SelectSubset<T, CollectionDeleteArgs<ExtArgs>>): Prisma.Prisma__CollectionClient<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CollectionUpdateArgs>(args: Prisma.SelectSubset<T, CollectionUpdateArgs<ExtArgs>>): Prisma.Prisma__CollectionClient<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CollectionDeleteManyArgs>(args?: Prisma.SelectSubset<T, CollectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CollectionUpdateManyArgs>(args: Prisma.SelectSubset<T, CollectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CollectionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CollectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CollectionUpsertArgs>(args: Prisma.SelectSubset<T, CollectionUpsertArgs<ExtArgs>>): Prisma.Prisma__CollectionClient<runtime.Types.Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CollectionCountArgs>(args?: Prisma.Subset<T, CollectionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CollectionCountAggregateOutputType> : number>;
    aggregate<T extends CollectionAggregateArgs>(args: Prisma.Subset<T, CollectionAggregateArgs>): Prisma.PrismaPromise<GetCollectionAggregateType<T>>;
    groupBy<T extends CollectionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CollectionGroupByArgs['orderBy'];
    } : {
        orderBy?: CollectionGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CollectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCollectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CollectionFieldRefs;
}
export interface Prisma__CollectionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    bookmarks<T extends Prisma.Collection$bookmarksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Collection$bookmarksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BookmarkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CollectionFieldRefs {
    readonly id: Prisma.FieldRef<"Collection", 'String'>;
    readonly name: Prisma.FieldRef<"Collection", 'String'>;
    readonly ownerId: Prisma.FieldRef<"Collection", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Collection", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Collection", 'DateTime'>;
}
export type CollectionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
    where: Prisma.CollectionWhereUniqueInput;
};
export type CollectionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
    where: Prisma.CollectionWhereUniqueInput;
};
export type CollectionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
    where?: Prisma.CollectionWhereInput;
    orderBy?: Prisma.CollectionOrderByWithRelationInput | Prisma.CollectionOrderByWithRelationInput[];
    cursor?: Prisma.CollectionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CollectionScalarFieldEnum | Prisma.CollectionScalarFieldEnum[];
};
export type CollectionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
    where?: Prisma.CollectionWhereInput;
    orderBy?: Prisma.CollectionOrderByWithRelationInput | Prisma.CollectionOrderByWithRelationInput[];
    cursor?: Prisma.CollectionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CollectionScalarFieldEnum | Prisma.CollectionScalarFieldEnum[];
};
export type CollectionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
    where?: Prisma.CollectionWhereInput;
    orderBy?: Prisma.CollectionOrderByWithRelationInput | Prisma.CollectionOrderByWithRelationInput[];
    cursor?: Prisma.CollectionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CollectionScalarFieldEnum | Prisma.CollectionScalarFieldEnum[];
};
export type CollectionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CollectionCreateInput, Prisma.CollectionUncheckedCreateInput>;
};
export type CollectionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CollectionCreateManyInput | Prisma.CollectionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CollectionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    data: Prisma.CollectionCreateManyInput | Prisma.CollectionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CollectionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CollectionUpdateInput, Prisma.CollectionUncheckedUpdateInput>;
    where: Prisma.CollectionWhereUniqueInput;
};
export type CollectionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CollectionUpdateManyMutationInput, Prisma.CollectionUncheckedUpdateManyInput>;
    where?: Prisma.CollectionWhereInput;
    limit?: number;
};
export type CollectionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CollectionUpdateManyMutationInput, Prisma.CollectionUncheckedUpdateManyInput>;
    where?: Prisma.CollectionWhereInput;
    limit?: number;
};
export type CollectionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
    where: Prisma.CollectionWhereUniqueInput;
    create: Prisma.XOR<Prisma.CollectionCreateInput, Prisma.CollectionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CollectionUpdateInput, Prisma.CollectionUncheckedUpdateInput>;
};
export type CollectionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
    where: Prisma.CollectionWhereUniqueInput;
};
export type CollectionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CollectionWhereInput;
    limit?: number;
};
export type Collection$bookmarksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BookmarkSelect<ExtArgs> | null;
    omit?: Prisma.BookmarkOmit<ExtArgs> | null;
    include?: Prisma.BookmarkInclude<ExtArgs> | null;
    where?: Prisma.BookmarkWhereInput;
    orderBy?: Prisma.BookmarkOrderByWithRelationInput | Prisma.BookmarkOrderByWithRelationInput[];
    cursor?: Prisma.BookmarkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BookmarkScalarFieldEnum | Prisma.BookmarkScalarFieldEnum[];
};
export type CollectionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CollectionSelect<ExtArgs> | null;
    omit?: Prisma.CollectionOmit<ExtArgs> | null;
    include?: Prisma.CollectionInclude<ExtArgs> | null;
};
