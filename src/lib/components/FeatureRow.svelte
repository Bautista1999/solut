<script>
    export let title = "";
    export let profile_image = "";
    export let approved_amount = 0;
    export let id = "";
</script>

<a class="feature-row" href={`/idea/${id}`} role="button" tabindex="0">
    <div class="row-header">
        <div class="feature-left">
            <span>{title}</span>
        </div>
        <span class="amount">{approved_amount.toFixed(3)} ICP</span>
    </div>
</a>

<style>
    .feature-row {
        display: block;
        padding: 0.75rem 0.5rem;
        text-decoration: none;
        color: inherit;
        background: var(--tertiary-color);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .feature-row:hover {
        background: color-mix(
            in srgb,
            var(--primary-color) 4%,
            var(--tertiary-color)
        );
        transform: translateY(-1px);
    }

    .feature-row:active {
        transform: translateY(0);
    }

    .row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .feature-left {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.95rem;
        font-weight: 500;
        letter-spacing: -0.01em;
    }

    .feature-image {
        width: 30px;
        height: 30px;
        border-radius: 3px;
        object-fit: cover;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }

    .feature-image:hover {
        transform: translateY(-2px) translateX(-2px);
        box-shadow: 2px 2px 0px 0px var(--seventh-color);
    }

    .feature-image:active {
        transform: translateY(0) translateX(0);
        box-shadow: 0px 0px 0px 0px var(--seventh-color);
    }

    .amount {
        color: var(--primary-color);
        font-weight: 600;
        font-size: 0.95rem;
        font-feature-settings: "tnum" 1;
    }

    @media (max-width: 768px) {
        .feature-row {
            padding: 0.875rem 1rem;
        }
    }
</style>
