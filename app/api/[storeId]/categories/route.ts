import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismaDB from "@/lib/prisma";

export const POST = async (req: Request, { params }: { params: { storeId: string } }) => {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { name, billboardId } = body;

        if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
        if (!name) return new NextResponse("Name is required", { status: 400 });
        if (!billboardId) return new NextResponse("Billboard ID is required", { status: 400 });
        if (!params.storeId) return new NextResponse("Store id is required", { status: 400 });


        const storeByUserId = await prismaDB.store.findFirst({
            where: { id: params.storeId, userId }
        });

        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 405 });

        const category = await prismaDB.category.create({
            data: {
                name,
                billboardId,
                storeId: params.storeId,
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        return new NextResponse("Internal error", { status: 500 });
    }
};

export const GET = async (req: Request, { params }: { params: { storeId: string } }) => {
    try {
        if (!params.storeId) return new NextResponse("Store id is required", { status: 400 });

        const categories = await prismaDB.category.findMany({
            where: { storeId: params.storeId }
        });

        return NextResponse.json(categories);
    } catch (error) {
        return new NextResponse("Internal error", { status: 500 });
    }
};