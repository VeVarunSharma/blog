---
title: 'Don’t Let Legacy Data Break the Bank: How we reduced a data hosting cost from $4080 annually to $1.8 per year'
description: 'How Adauris preserved legacy MongoDB engagement data by moving a cluster snapshot to S3 Glacier and cutting recurring storage costs.'
publishedAt: 2024-07-03
tags:
  - 'aws'
  - 'mongodb'
  - 'cloud-cost-optimization'
  - 'software-development'
  - 'cloud-storage'
draft: false
featured: false
image:
  src: '/images/posts/dont-let-legacy-data-break-the-bank-how-we-reduced-a-data-hosting-cost-from-4080-annually-to-1-8-per-year/cover.jpg'
  alt: 'Bar chart comparing annual MongoDB hosting and S3 Glacier archive costs'
sourceUrl: 'https://medium.com/adauris-engineering/dont-let-legacy-data-break-the-bank-how-we-reduced-a-data-hosting-cost-from-4080-annually-to-1-8-678c3d4bd7b2'
sourcePublication: 'Adauris Engineering'
---

At [Adauris](https://www.adauris.ai/), we’re big believers in data-driven decision-making. But as a lean startup, we’re also obsessed with optimizing costs. Recently, we faced a challenge: how to preserve valuable MongoDB data (crucial for future analysis and due diligence) without breaking the bank on a $4,080/year database subscription we weren’t actively using.

<figure class="content-figure">
  <img src="/images/posts/dont-let-legacy-data-break-the-bank-how-we-reduced-a-data-hosting-cost-from-4080-annually-to-1-8-per-year/cover.jpg" alt="Bar chart comparing annual MongoDB hosting and S3 Glacier archive costs" loading="lazy" decoding="async" />
  <figcaption>Annual data-hosting cost comparison.</figcaption>
</figure>

> **Historical case study (July 2024):** These figures reflect Adauris’s workload, then-current AWS pricing, and available cloud credits. Retrieval, egress, redundancy, retention, and current storage pricing can materially change the total. Using the quoted $4,080 and $1.80 annual figures gives an approximately 99.96% reduction; the original article states 99.98%.

This post dives into our exploration of different solutions, the technical trade-offs involved, and the implementation details of the strategy that delivered **a jaw-dropping 99.98% cost reduction!**

This is just one of many cloud cost reduction initiatives we’re currently undertaking within my startup, [Adauris](https://www.adauris.ai/). I’ll continue to share the more exciting cost saving updates with the community as these efforts are completed!

## The Problem: Legacy Data, Hefty Price Tag

Our MongoDB database housed two years of audio engagement data — a goldmine of insights into listener behavior. While not immediately needed for our current product roadmap, this data formed a key part of our “data defensibility moat,” essential for demonstrating proof of our data moat to potential investors or acquirers.

However, we were paying $340/month ($4080 annually) for a Mongo DB cluster we weren’t highly actively using. While essential data, the high cost contributed to our burn rate. This is a scenario many startups face with legacy systems and data.

## The Solution Space: Exploring Our Options

We evaluated several approaches, weighing their pros and cons:

1.  **Local Download + Cloud Archive:** Tempting for its simplicity, but our snapshot size (40–60GB) exceeded local storage on my computer, and the restoration process would be painfully slow.
2.  **Direct Upload to Cloud Archive (S3 Glacier):** This offered the lowest storage cost (around $0.15/month for our data size), but with potentially high retrieval fees and a lengthy retrieval process (hours).
3.  **File-Based Transformation + Cloud Object Storage:** This provided flexibility and cost-effectiveness for long-term storage in a non-MongoDB format. However, it would require significant development effort to transform and potentially restructure the data.
4.  **EC2 Instance + S3 Glacier Migration for Cluster Snapshot:** This hybrid approach emerged as the winner. It bypassed our local storage limitations, offered potentially faster uploads via EC2’s robust network connectivity, and allowed us to leverage our existing AWS credits for both migration and long-term storage.

<figure class="content-figure">
  <img src="/images/posts/dont-let-legacy-data-break-the-bank-how-we-reduced-a-data-hosting-cost-from-4080-annually-to-1-8-per-year/image-01.png" alt="Metadata describing the legacy MongoDB cluster" loading="lazy" decoding="async" />
  <figcaption>Metadata about the MongoDB cluster.</figcaption>
</figure>

## Decision:

We migrated a **MongoDB cluster snapshot directly to S3 Glacier from an EC2 instance**.

This decision was driven by the following factors:

1.  **No local storage constraints:** My computer lacked sufficient space to download the entire snapshot locally given that this dataset was massive.
2.  **Ultra-low cost & AWS Credits:** Glacier offers some of the cheapest archival storage, and our existing AWS credits covered the entire process (But real gross costs remain at 1.8$ per year.
3.  **Ease of cluster re-instantiation:** A snapshot allows us to restore the exact cluster state if needed.
4.  **Flexible data access:** If the data needs to be used outside of MongoDB, we can restore a new cluster and re-export.
5.  **Understanding Cluster Snapshots:** A snapshot is a point-in-time copy of the entire MongoDB cluster (data, settings, indexes). They’re useful for backups, restoration, and data migration hence why exporting this over collections made the most sense.
6.  **Safer long term storage:** While mongo offers saving cluster snapshots, we wanted to fully own the data in-house, and not risk an inactive account from being removed or a snapshot not being saved in perpetuity.

<figure class="content-figure">
  <img src="/images/posts/dont-let-legacy-data-break-the-bank-how-we-reduced-a-data-hosting-cost-from-4080-annually-to-1-8-per-year/image-02.png" alt="Architecture diagram showing a MongoDB snapshot migrating through EC2 to S3 Glacier" loading="lazy" decoding="async" />
  <figcaption>The EC2 and S3 Glacier migration path for the MongoDB cluster snapshot.</figcaption>
</figure>

## Implementation: A Step-by-Step Guide

1.  **EC2 Instance Setup:** We launched a m5dn.large EC2 instance (optimized for storage and network I/O) running Amazon Linux 2. The NVMe SSD and powerful network capabilities of this instance type were crucial for handling the large data transfer efficiently.
2.  **MongoDB Cluster Snapshot and Download:** We initiated a snapshot of our MongoDB cluster and downloaded it directly to the EC2 instance. We opted for a cluster snapshot over individual collection exports to preserve database-level configurations and relationships.
3.  **S3 Glacier Bucket Creation:** In parallel, we created a dedicated S3 bucket specifically configured for Glacier storage. We chose Glacier for its ultra-low storage costs, accepting the trade-off of slower retrieval times since we didn’t anticipate needing immediate access.
4.  **S3 CLI Configuration and Upload:** Using the AWS CLI on the EC2 instance, we securely uploaded the snapshot from the instance’s disk to our S3 Glacier bucket.

## The Outcome: A Massive Win for Our Bottom Line

By migrating our MongoDB snapshot to S3 Glacier, we slashed our annual database costs from $4,080 to a mere $1.8 — **a staggering 99.98% reduction!**

Furthermore, leveraging our AWS credits meant the entire migration and storage costs were essentially free for the foreseeable future.

<figure class="content-figure">
  <img src="/images/posts/dont-let-legacy-data-break-the-bank-how-we-reduced-a-data-hosting-cost-from-4080-annually-to-1-8-per-year/image-03.png" alt="MongoDB Atlas screen confirming that the legacy cluster was shut down" loading="lazy" decoding="async" />
  <figcaption>Shutting down the legacy cluster.</figcaption>
</figure>

## Key Takeaways: Cost Optimization for Startup Success

This project highlighted some crucial cost optimization lessons for startups:

1.  **Don’t overspend on idle data:** If you have data that isn’t actively being used, explore cost-effective archiving solutions.
2.  **Leverage cloud storage tiers:** Choose storage classes that align with your data access patterns and cost constraints.
3.  **Use cloud credits strategically:** Make the most of free credits to offset migration and storage expenses.
4.  **Prioritize data defensibility:** Even if you’re not using data now, preserve it securely for future analysis or due diligence.

By embracing these principles, we’ve not only freed up valuable resources but also positioned ourselves for long-term data-driven success.

Remember, every dollar saved is a dollar invested in building the future of your startup.
