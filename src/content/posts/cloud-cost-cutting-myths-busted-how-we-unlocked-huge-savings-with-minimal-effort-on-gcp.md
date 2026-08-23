---
title: 'Cloud Cost Cutting Myths Busted: How We Unlocked Huge Savings With Minimal Effort on GCP'
description: 'A 2024 Adauris case study on low-effort changes to logging, storage, Cloud Run, Compute Engine, and legacy data hosting.'
publishedAt: 2024-07-23
tags:
  - 'google-for-startups'
  - 'startup'
  - 'google-cloud-platform'
  - 'cloud-optimization'
  - 'finops'
draft: false
featured: false
image:
  src: '/images/posts/cloud-cost-cutting-myths-busted-how-we-unlocked-huge-savings-with-minimal-effort-on-gcp/cover.png'
  alt: 'Ve Varun Sharma and Dmitriy co-hosting a Google for Startups alumni seminar on cloud costs'
sourceUrl: 'https://medium.com/adauris-engineering/cloud-cost-cutting-myths-busted-how-we-unlocked-huge-savings-with-minimal-effort-on-gcp-0aa2f03ee164'
sourcePublication: 'Adauris Engineering'
---

<figure class="content-figure">
  <img src="/images/posts/cloud-cost-cutting-myths-busted-how-we-unlocked-huge-savings-with-minimal-effort-on-gcp/cover.png" alt="Ve Varun Sharma and Dmitriy co-hosting a Google for Startups alumni seminar on cloud costs" loading="lazy" decoding="async" />
  <figcaption>Google for Startups alumni seminar co-hosted by Dmitriy and Ve.</figcaption>
</figure>

> **Historical case study (July 2024):** Savings reflect Adauris’s specific workloads, usage, credits, and 2024 cloud pricing. Verify current service pricing before applying these figures. The source uses both $4,060 and $4,080 for the legacy-data baseline; both values are retained as originally published rather than silently reconciled.

In the fast-paced world of startups, every dollar counts. As CTO and co-founder of [Adauris](https://adauris.ai/), I understand the pressure to optimize spending while simultaneously scaling our startup & focusing on product development. One area where this tension is often felt most acutely is cloud costs. The myth that cloud optimization is a herculean effort often deters startups from pursuing potentially massive savings.

There is a common misconception that optimizing cloud spending is a huge effort and an intensive endeavour that distracts from core product development. While it’s true that comprehensive cloud cost optimization can be complex, **the reality is that many startups are sitting on a goldmine of “low-hanging fruit” — simple, high-impact actions that can significantly reduce their cloud bills.**

This was the core message I aimed to convey during a recent “[Alumni to Alumni: Cloud Cost Cutting Secrets](https://rsvp.withgoogle.com/events/na-alumni-event-google-cloud-cost)” talk I co-hosted for [Google for Startups Accelerator](https://startup.google.com/programs/accelerator/). During the session, I shared practical insights and real-world examples from Adauris, demonstrating how we slashed our cloud expenses by over $30,000 annually (albeit I didn’t list all items we did but the key high impact low effort initiatives), primarily on [Google Cloud Platform (GCP)](https://cloud.google.com/), with minimal effort.

## Challenging the “Giant Effort” Paradigm: Low-Hanging Fruit for Big Savings

<figure class="content-figure">
  <img src="/images/posts/cloud-cost-cutting-myths-busted-how-we-unlocked-huge-savings-with-minimal-effort-on-gcp/image-01.png" alt="GCP billing chart showing a large reduction in total cloud spend" loading="lazy" decoding="async" />
  <figcaption>A snapshot of the reduction in global GCP spend.</figcaption>
</figure>

The key takeaway? Cloud cost optimization doesn’t have to be a daunting undertaking. By focusing on finding low effort high yield wins startups can unlock substantial savings without derailing their core operations.

The crux of effective cloud cost optimization lies in identifying and capitalizing on quick wins.

Here’s a glimpse into how we tackled this at Adauris. There were quite a number of actions we took but we’ll focus on the top high impact and low effort items we did.

### 1\. Cloud Logging: Eliminating Unnecessary Logs Saved Us up to $3,600 Annually

<figure class="content-figure">
  <img src="/images/posts/cloud-cost-cutting-myths-busted-how-we-unlocked-huge-savings-with-minimal-effort-on-gcp/image-02.png" alt="Cloud Logging cost chart from December 2022 through July 2024 showing costs falling from hundreds of dollars per month to near zero" loading="lazy" decoding="async" />
  <figcaption>Cloud Logging costs fell from hundreds of dollars per month to near zero.</figcaption>
</figure>

We’ll begin with one my favourite cloud optimization efforts, but also one that’s slightly embarrassing due to the simplicity of it and how it was because we were dirtying our own logging data.

**Challenge:** Our microservices were generating a massive volume of verbose console logs, leading to unnecessary Cloud Logging costs. The costs were as high as nearly $500/month, and it started to average $300/month or $3,600/year 😲.

**Solution:** We implemented a more disciplined logging strategy, focusing on structured logging and reducing the verbosity of console logs. We filtered out non-critical logs at the application level, reducing the volume of data sent to Cloud Logging.

In short, we dedicated a day removing all of the unneeded console.logs() across our Node.JS microservices services.

**Impact:** This resulted in reducing Cloud Logging costs by approximately -98% reduction, resulting in a $3,600 annual saving. Our new Cloud Logging costs are ***$5.50/month or $66/year*** 😲. This was achieved in just a day’s work!

**Technical Insight:** I recommend prioritizing logging for debugging and error monitoring only over general informational messages. Structured logging, preferably in JSON format, allows for easier analysis and filtering and can reduce storage needs.
Another tip is that in pull requests reviews, if any development console logs are left in the code that the reviewer ensure’s that they are removed before final deployment to production.

### **2\. Cloud Storage: A Single Day’s Work Saved Us $8,400 Annually**

<figure class="content-figure">
  <img src="/images/posts/cloud-cost-cutting-myths-busted-how-we-unlocked-huge-savings-with-minimal-effort-on-gcp/image-03.png" alt="Google Cloud Storage cost chart showing lower monthly spend" loading="lazy" decoding="async" />
  <figcaption>Google Cloud Storage costs.</figcaption>
</figure>

**Challenge:** We discovered that a considerable chunk of our cloud storage was occupied by unused and “dead” data from churned customers and due to previous bugs in our system where we were over generating larger audio files. To address this, I developed a script that efficiently identified and removed this unnecessary data. These storage objects were multi-region as well so we were paying a hefty premium on these. On average we were paying around $1000/month and reached as high as $1800 some months.

**Solution:** I developed a bash script that interfaced with the Cloud Storage API to identify and delete objects based on various conditions such as whether the customer was paying or active to protect their data, etc., and removed the thousands of dead accounts and their associated “dead” objects.

After implementing this which took about a day’s work, this brought the Cloud Storage costs down to an average of $1000/month to $300/month.

**Key Takeaways for Your Infrastructure:** Regularly analyze storage usage patterns. Implement object versioning and lifecycle policies to automate data archiving or deletion based on age, access frequency, or other criteria. Also, I’d recommend spring cleaning days for your Cloud Storage that happen quarterly at least so that dead data is routinely removed outside of these automated object lifecycle policies.

**Impact:** _**In a single day’s work resulted in over $8,400 in annualized savings for our Cloud Storage**_ costs 💸.

### **3\. Legacy Data Hosting: From $4,060 to $1.8 per Year with a Simple Migration**

<figure class="content-figure">
  <img src="/images/posts/cloud-cost-cutting-myths-busted-how-we-unlocked-huge-savings-with-minimal-effort-on-gcp/image-04.jpg" alt="MongoDB cluster cost chart showing the legacy hosting baseline" loading="lazy" decoding="async" />
  <figcaption>MongoDB cluster costs.</figcaption>
</figure>

**Challenge:** We had legacy user engagement data that we wanted to preserve from MongoDB and we deemed it that it could be crucial for future analysis and technical due diligence down the line but we were paying a hefty price tag on it. This data included millions of data points of users engaging with our audio.

**Solution:** We migrated this data to AWS S3 Glacier and a back up in GCP Cold Line storage. This involved writing a Bash script within a VM to migrate our MongoDB cluster as a compressed snapshot and stored as a simple S3 Glacier object and GCP Cold Line object.

This one-time effort of writing a bash script was a small investment for such a significant return.

**Impact: _In just a couple of hours of work we reduced our annual legacy data hosting costs by over -99.9% from an annual cost of $4,060 to $1.8 per Year!_**

**Key Takeaways for Your Infrastructure:** In our case, because this was legacy data that we no longer needed to frequently access, S3 Glacier and Cold Line storage was the ideal solution for this data, making it perfect for backups or archives. The trade-off is a slightly higher retrieval cost when needed, but for this very infrequently accessed data, the overall savings were substantial.

### **4\. Cloud Run: Right-Sizing Our Resources Slashed Costs by Over $4000**

<figure class="content-figure">
  <img src="/images/posts/cloud-cost-cutting-myths-busted-how-we-unlocked-huge-savings-with-minimal-effort-on-gcp/image-05.png" alt="Google Cloud Run cost chart showing spend after right-sizing services" loading="lazy" decoding="async" />
  <figcaption>Google Cloud Run costs.</figcaption>
</figure>

**Challenge:** Cloud Run services were over provisioned with CPU and memory resources, as well as too many duplicated services, leading to inflated costs. Our Cloud Run costs had reached as high as $870/month, and was reaching an average cost of $475/month.

**Solution:** By closely analyzing our usage patterns and optimizing our CPU and memory allocation, we were able to significantly reduce costs. Additionally, shutting down under utilized resources and merging some microservices further enhanced our savings.

**Impact:** By spending just a few days of work spread across a month this work resulted in _**bringing down our Cloud Run costs by over $4000 annually as the average costs was brought down to $140/month**_ and while maintaining high performance of our services.

**Key Takeaways for Your Infrastructure:** I’d recommend regularly reviewing resource utilization metrics. Configure autoscaling with appropriate minimum and maximum instances to automatically adapt to traffic fluctuations, and ensure closely aligned service responsibilities can be grouped in one service where it makes sense.

### **5\. Compute Engine: Simple Workload Resizing Saved $1,200 Per Year**

<figure class="content-figure">
  <img src="/images/posts/cloud-cost-cutting-myths-busted-how-we-unlocked-huge-savings-with-minimal-effort-on-gcp/image-06.png" alt="Google Compute Engine cost chart showing savings from workload resizing" loading="lazy" decoding="async" />
  <figcaption>Google Compute Engine costs.</figcaption>
</figure>

**Challenge:** We discovered that Compute Engine instances were running on larger machine types than required for their workloads, resulting in wasted resources.

**Solution:** We analyzed workload requirements and downsized instances to smaller, more cost-effective machine types. We also explored alternative runtimes like [Bun.sh](https://bun.sh/) for specific workloads, leveraging its CPU efficiency to further reduce instance size requirements.

**Impact:** _**A few hours of work yielded $1,200 in annual Compute Engine cost savings.**_

**Key Takeaways for Your Infrastructure:** I suggest to actively monitor CPU and memory utilization for your instances and using infrastructure tags to understand what features are really being used as. I would also explore more efficient runtimes if applicable to your tech stack.

## The Myth of the “Giant Effort and large distraction” Debunked: Your Startup’s Cloud Can Be a Goldmine

In the startup world, we’re constantly reminded that every dollar saved is a dollar invested in growth. While the sheer scale of cloud services can seem daunting, our experience at Adauris proves that significant cost optimization is achievable — and often simpler than we anticipate.

By tackling the “low-hanging fruit” outlined in this article — cleaning up storage, right-sizing resources, and implementing disciplined logging and more we couldn’t cover in this article — we unlocked over $30,000 in annual savings on GCP _without_ compromising performance or derailing product development.

These wins highlight a _crucial truth_: **cloud cost optimization doesn’t have to be a massive effort and a large distraction for your startup, and low effort & high impact wins more than likely exist in your cloud spend.**

By integrating these ongoing practices into your workflow, you can free up valuable resources, extend your runway, and ensure your cloud infrastructure is a catalyst for growth, not a constraint. Start small, celebrate the wins, and by being consistently proactive with managing your cloud costs you can control them with ease.
