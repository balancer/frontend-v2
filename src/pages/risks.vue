<script lang="ts" setup>
import { RiskKey } from '@/types/pools';
</script>

<template>
  <div class="pb-4 risks">
    <div class="pb-3">
      <h1>Sobal Protocol Risks</h1>
      <p>
        There are many inherent risks developers accept when working in DeFi and
        using the Sobal Protocol. This page aims to summarize the top risks to
        help you with your risk decisions. It is important to note that this
        list is not exhaustive, and there may be additional risks not explicitly
        mentioned here. As the risk environment is fluid, we expect to
        periodically update this summary.
      </p>
    </div>

    <nav class="nav">
      <h4 class="mb-2">Page contents</h4>

      <h5 class="mb-2">Liquidity Provider risks</h5>

      <ul>
        <li class="toc-link">
          <router-link to="risks#general-risks"
            ><span class="font-semibold">General risks</span></router-link
          >
          <ul>
            <li class="text-sm toc-link">
              <router-link to="risks#general-risks"
                >Smart contract risk</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#economic-risk"
                >Mechanism / economic risk</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#toxic-token-risk"
                >Toxic token risk</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#composability-risk"
                >DeFi composability risk</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#governance-risk"
                >DAO Governance risk</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#flash-loans-risk"
                >Flash Loans risk</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#mutable-attributes-risk"
                >Mutable pool attributes risk</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#join-exit-risk"
                >Join/exit risk</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#impermanent-loss-risk"
                >Impermanent loss risk</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#ui-risk">User Interface risk</router-link>
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#regulatory-risk"
                >Regulatory risk</router-link
              >
            </li>
          </ul>
        </li>
        <li class="toc-link">
          <router-link to="risks#pool-type-risks"
            ><span class="font-semibold">Pool type risks</span></router-link
          >
          <ul>
            <li class="text-sm toc-link">
              <router-link to="risks#weighted-pools"
                >Weighted Pools</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#stable-pools">Stable Pools</router-link>
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#composable-pools"
                >Composable Stable Pools</router-link
              >
            </li>
            <li class="text-sm toc-link">
              <router-link to="risks#boosted-pools">Boosted Pools</router-link>
            </li>
          </ul>
        </li>
        <li class="toc-link">
          <router-link to="risks#network-risks"
            ><span class="font-semibold"
              >Layer 2 network risks</span
            ></router-link
          >
          <ul>
            <li class="text-sm toc-link">
              <router-link to="risks#neonevm">Neon EVM</router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <h2>Risks for Liquidity Providers (LPs)</h2>

    <div :id="RiskKey.General" class="risk">
      <h3>General risks</h3>
      <h4>Smart contract risk</h4>
      <p>
        Smart contract risk is a general risk when using DeFi protocols,
        including Sobal. Smart contracts are self-executing pieces of code that
        run on certain blockchains, like Ethereum. Although they are designed to
        be secure, they can be vulnerable to bugs and exploits.
      </p>
      <p>
        If there is a flaw in the smart contract code, it can be exploited by
        attackers to steal funds from the protocol. This can result in the loss
        of funds for liquidity providers and swappers who are using the
        protocol. Smart contract risk is a major risk for all DeFi users, and it
        is important to carefully evaluate the security of the protocols before
        using them.
      </p>
      <h5>The Sobal Vault</h5>
      <p>
        Sobal utilises a single vault that holds and manages all the assets
        added by all Sobal pools. This separates the AMM logic from the token
        management and accounting. Token management/accounting is done by the
        vault while the AMM logic is individual to each pool. This provides many
        advantages, including flexibility and gas efficiency.
      </p>
      <p>
        One critique of this approach is that the Sobal Vault could be a single
        point of failure—i.e. hack the vault, get all the tokens of the
        protocol. This Sobal Vault architecture was heavily audited prior to
        launch and has now been battle-tested since May 2021, securing over $3b.
        It has also been forked by other teams across different networks,
        including Beethoven X on Fantom, without issue.
      </p>
      <h5>How does Sobal work to mitigate this risk?</h5>
      <ul>
        <li>
          Development teams have engaged with top tier smart contract auditing
          firms to identify and fix bugs before deployment.
        </li>
        <li>
          The core of Sobal smart contracts are immutable and do not use proxies
          or other upgrade mechanisms. Note: Within DeFI, upgradable contracts
          are a major way exploits have been introduced.
        </li>
        <li>
          Sobal will be working towards launching a bug bounty program to
          attract white-hat hackers to responsibly disclose any bugs.
        </li>
      </ul>
      <h5>How can LPs mitigate this risk?</h5>
      <ul>
        <li>
          LPs should carefully research and use DeFi protocols that are
          battle-tested with a history of functioning as intended, while
          securing large amounts of assets.
        </li>
        <li>
          To diversify risk, LPs may consider not placing all their tokens into
          a single protocol.
        </li>
      </ul>
    </div>

    <div :id="RiskKey.Economic" class="risk">
      <h4>Mechanism / Economic risk</h4>
      <p>
        An mechanism or economic exploit of a DeFi protocol occurs when an
        attacker is able to manipulate the economic incentives of the protocol
        to their advantage, resulting in a loss of funds for other participants.
        This can happen even when there are no smart contract bugs or other
        unintended logic errors.
      </p>
      <p>
        For example, an attacker could take advantage of a liquidity pool's
        pricing mechanism to intentionally cause the price of an asset to
        deviate from its true value, allowing them to buy or sell that asset at
        a profit.
      </p>
      <p>
        In addition, the composable nature of DeFi means that a pool on Sobal
        may contain tokens that may be manipulated by an attacker on a third
        party protocol, which further increases risk.
      </p>
      <p>
        These types of economic exploits are difficult to detect and prevent.
      </p>
      <h5>How does Sobal work to mitigate this risk?</h5>
      <ul>
        <li>
          Sobal strives to deliver careful economic modeling, rigorous mechanism
          design, testing and audits by top tier auditing firms.
        </li>
      </ul>
      <h5>How can LPs mitigate this risk?</h5>
      <ul>
        <li>
          LPs should carefully research and use DeFi platforms that are
          battle-tested with a history of functioning as intended, while
          securing large amounts of assets.
        </li>
      </ul>
    </div>
    <div :id="RiskKey.ToxicToken" class="risk">
      <h4>Toxic pool token risk</h4>
      <p>
        A liquidity pool is only as good as its weakest token. This is because
        liquidity pools typically sell the winners (tokens moving up in price)
        and accumulate the losers (tokens moving down in price). If a pool
        contains a toxic token, the value of the BPT (LP tokens) of the
        liquidity pool could go to zero. This is the case even if the other pool
        tokens remain good and would otherwise not be affected.
      </p>
      <p>
        A toxic token could be seeded into a liquidity pool by a malicious pool
        creator or an otherwise good token could become toxic (similar to
        Terra’s stablecoin <code>UST</code>).
      </p>
      <h5>Tokens that could become problematic for LPs:</h5>

      <ul>
        <li>
          Unsupported tokens on Sobal Protocol, including:
          <ul class="mt-2">
            <li>
              <router-link to="risks#rebasing-tokens"
                ><span class="link">Rebasing tokens</span></router-link
              >
            </li>
            <li>Tokens with transfer fees</li>
            <li>Proxy tokens with double entry points</li>
            <li>Tokens with more than 18 decimal points</li>
            <li>Rebasing tokens</li>
          </ul>
        </li>

        <li>
          Tokens that become toxic, including:
          <ul class="mt-2">
            <li>Tokens that are infinitely minted</li>
            <li>Tokens that become frozen or exploited in any other way</li>
            <li>Stablecoins that lose their peg</li>
          </ul>
        </li>
      </ul>

      <div :id="RiskKey.RebaseToken" class="risk">
        <h5>Rebasing tokens</h5>
        <p>
          Rebasing tokens are a type of cryptocurrency that adjusts the supply
          of the token based on a predetermined formula. This formula is usually
          designed to keep the price of the token stable relative to some
          external metric, such as the price of a particular asset or a specific
          index. When the external metric changes, the token supply is adjusted,
          which in turn affects the price of the token.
        </p>
        <p>
          For example, if a rebasing token is designed to maintain a price of $1
          per token and the price of the external asset goes up by 10%, the
          token supply would decrease by 10% to maintain the $1 price point.
          Similarly, if the external asset price goes down by 10%, the token
          supply would increase by 10%.
        </p>
        <p>
          Some examples of rebasing tokens include <code>stETH</code> and
          <code>AMPL</code>.
        </p>
        <p>
          Unfortunately, rebasing tokens generally don’t work well in liquidity
          pools since LPs may suffer losses when rebasing occurs.
        </p>
      </div>

      <h5>How does Sobal mitigate these risks?</h5>
      <ul>
        <li>
          Since the Sobal protocol is permissionless, anyone can create a
          liquidity pool composed of any ERC-20 token. This makes this type of
          risk difficult to mitigate.
        </li>
        <li>
          The Sobal App UI may be updated to exclude blacklisted tokens and
          pools but LPs should not rely on this.
        </li>
        <li>
          Instead of including tokens which rebase, new DeFi liquidity pool
          compatible wrapped tokens which do not rebase may be utilized.
        </li>
        <li>
          For Sobal Managed Pools, a novel feature called ‘circuit breakers’ has
          been designed to halt swapping if there is a large, uncorrelated drop
          in a token’s value.
        </li>
        <li>
          New pools have a ‘recovery mode’ which can be enabled by the Emergency
          DAO Multisig. Pools in recovery mode provide a simple way for LPs to
          exit the pool proportionally at the cost of disabling protocol fees
          (swaps, joins etc still work).
        </li>
      </ul>

      <h5>How can LPs mitigate these risks?</h5>
      <ul>
        <li>
          LPs should carefully check each pool constituent token and understand
          its specific risks.
        </li>
        <li>
          LP’s should review all pool tokens before providing liquidity to
          ensure no constituent pool tokens are unsupported by the Sobal
          Protocol (e.g. rebasing tokens).
        </li>
        <li>
          LPs should carefully check the pool creator address to verify it’s
          from a reliable actor.
        </li>
      </ul>
    </div>

    <div :id="RiskKey.Composability" class="risk">
      <h4>DeFi composability risks</h4>
      <p>
        DeFi composability refers to the ability of different DeFi protocols and
        applications to work together seamlessly in endless combinations,
        allowing developers to create more complex financial transactions and
        applications. This is sometimes referred to as DeFi lego building
        blocks, since they can be combined and connected to created interesting
        new structures and applications.
      </p>
      <p>
        While composability offers many benefits, layering on protocols and
        applications on top of each other comes with additional risks. For
        example, risks get compounded when multiple protocols are composed
        together, as a vulnerability in one contract could impact others. The
        interconnectivity of DeFi protocols can amplify risks, turning isolated
        incidents into systemic threats. For example, if a major protocol fails
        or suffers from an exploit, it could lead to a domino effect, impacting
        other protocols and users in the ecosystem.
      </p>
      <p>
        Other risks could cascade if a protocol within a composability stack has
        a liquidity crisis, an unfavorable governance decision or regulatory
        outcome.
      </p>
    </div>

    <div :id="RiskKey.Governance" class="risk">
      <h4>DAO Governance risk</h4>
      <p>
        Sobal plans to use off-chain voting mechanisms to signal the will of its
        users. This off-chain voting will be done via
        <a class="link" href="https://snapshot.org/">Snapshot</a>.
      </p>
      <p>
        A summary of the immutability of the Sobal Protocol’s smart contracts:
      </p>
      <ul>
        <li>
          Sobal contracts do allow for some tweaking of core protocol
          parameters, including the ability to:
          <ul class="mt-2">
            <li>
              Set a share of swap fees to be diverted to the protocol (hard
              capped at 50% of the swap fee)
            </li>
            <li>Set a Flash Loan fee</li>
            <li>
              Extract from the vault collected protocol fees and/or excess
              balances (e.g. airdrops), to any destination
            </li>
            <li>Set the address of the oracle implementation</li>
            <li>
              Set relayer addresses: relayers are (user opt-in, audited)
              contracts that can make calls to the vault (with the transaction
              “sender” being any arbitrary address) and use the sender’s ERC20
              vault allowance, internal balance or BPTs on their behalf
            </li>
            <li>
              Set dynamic-fee controllers: addresses (initially assigned to
              Gauntlet) that may change the swap fee for pools created by the
              dynamic-fee pool factory that will be deployed by Sobal
            </li>
          </ul>
        </li>
      </ul>
      <p>Note: The system of Sobal Governance may change in the future.</p>
      <p>
        The main risk with this setup consisting of off-chain voting executed by
        MultiSigs:
      </p>
      <ul>
        <li>
          The Multisig signers could go rogue and disregard the decision made by
          in the off-chain voting.
        </li>
        <li>
          The Multisig signers could mistakenly execute the wrong instruction
          without malice.
        </li>
        <li>
          An individual or an entity could acquire substantial voting tokens and
          vote against the interests of the majority of the community.
        </li>
      </ul>
      <h5>How Sobal aims to mitigate this risk:</h5>
      <ul>
        <li>
          The core of Sobal smart contracts are immutable and do not use proxies
          or other upgrade mechanisms. Only parameters, which are considered to
          be less ‘dangerous’ may be tweaked.
        </li>
        <li>
          The Multisig does&nbsp;not&nbsp;have custody of, nor control over,
          funds from liquidity providers locked inside Sobal Protocol contracts.
          Sobal was designed so that even if a multisig goes rogue, all the
          liquidity is safe and can be withdrawn by their rightful owners.
        </li>
      </ul>
      <h5>How LPs can mitigate this risk:</h5>
      <ul>
        <li>
          LPs should stay up to date with Sobal Governance by following
          discussions on the forum and participating in the off-chain voting.
        </li>
        <li>
          LPs may review past votes and verify that the DAO Multisig has
          executed outcomes accurately.
        </li>
      </ul>
    </div>

    <div :id="RiskKey.FlashLoan" class="risk">
      <h4>Flash Loans risk</h4>
      <p>
        A Flash Loan is a type of loan where a user borrows assets with no
        upfront collateral and returns the borrowed assets within the same
        blockchain transaction. Flash Loans use smart contracts which requires
        that a borrower repays the loan before the transaction ends. They are
        typically used for arbitrage opportunities, collateral swaps and to
        lower transaction fees, across potentially multiple protocols. It’s a
        powerful new financial primitive, native to DeFi.
      </p>
      <p>Flash Loans may be used on Sobal and interact with the Sobal Vault.</p>
      <p>
        While Flash Loans offer many benefits, they also comes with certain
        risks. Flash Loans have also been used for multiple DeFi exploits
        resulting in losses worth millions of dollars. Flash Loan exploits are
        relatively new with the full range of attack surfaces still being
        discovered.
      </p>
      <h5>How Sobal aims to mitigate this risk:</h5>
      <ul>
        <li>
          The Sobal Vault is non-reentrant, which blocks most Flash Loan
          attacks.
        </li>
        <li>
          Sobal strives to deliver careful economic modeling, rigorous mechanism
          design, testing and audits by top tier auditing firms.
        </li>
      </ul>
    </div>

    <div :id="RiskKey.Mutable" class="risk">
      <h4>Mutable pool attributes</h4>
      <p>
        Sobal is a flexible AMM that allows people to create different types of
        liquidity pools, including those with immutable and/or mutable pool
        attributes.
      </p>
      <p>
        For pools with immutable attributes, LPs can be assured that the rules
        are designed so they cannot change once they have provided liquidity
        since no pool attribute should be changed by anyone at any time.
      </p>
      <p>For pools with mutable attributes, LPs should understand:</p>
      <ul>
        <li>
          Which attributes can change
          <ul>
            <li>
              Certain attributes being mutable provide more risk than others.
              For example, changing the swap fee percentage is generally viewed
              as less risky than the ability to change the constituent tokens of
              a pool, since a malicious editor could introduce a toxic pool
              token.
            </li>
          </ul>
        </li>
        <li>
          Who can change each attribute
          <ul>
            <li>
              On Sobal pools, if an attribute is editable, the address that can
              make the edit is also specified. The two most common parties that
              are set to be able to change pool attributes are either the Pool
              Owner or Sobal Governance.
            </li>
          </ul>
        </li>
      </ul>
      <h5>How does Sobal work to mitigate this risk?</h5>
      <ul>
        <li>
          For known pool types, the Sobal App UI transparently displays pool
          attributes and specifies if it is editable and if so, by whom.
        </li>
        <li>
          Sobal Managed Pools are designed to have mutable attributes that can
          be changed by the Pool Owner. For certain ‘dangerous operations’,
          there are ‘timelock delays’ which give LPs a period to review the
          proposed changes and withdraw funds if they do not agree with the
          change. In addition, Pool Controllers can set a guardian who has the
          ability to veto a proposed change from the Pool Owner if they believe
          it to be a malicious change or a mistake.
        </li>
      </ul>
      <h5>How can LPs mitigate this risk?</h5>
      <ul>
        <li>
          LPs should check to see the edibility of pool attributes and
          understand who can authorize any changes.
        </li>
      </ul>
    </div>

    <div :id="RiskKey.JoinExit" class="risk">
      <h4>Loss of funds on join/exit of a pool</h4>
      <h5>Due to high price impact</h5>
      <p>
        When joining a pool, LPs should be aware of the price impact from adding
        tokens to the pool. In general, adding liquidity in proportional amounts
        to the token weights of the pool incur low price impact. Adding custom
        token amounts (non-proportionally) causes the internal prices of the
        pool to change, as if you were swapping tokens. The higher the price
        impact the more you'll spend in swap fees.
      </p>
      <h5>Due to slippage</h5>
      <p>
        LPs should also consider the effect of slippage when adding liquidity to
        a pool. Slippage occurs when market conditions change between the time
        your order is submitted and the time it gets executed on Neon. Slippage
        tolerance is the maximum change in price you are willing to accept.
      </p>
      <p>
        Slippage tolerance is a setting in both the Add/Remove liquidity flows
        on the Sobal App UI. Setting a low slippage tolerance protects you from
        front-running bots and miner extractable value (MEV).
      </p>
      <h5>Due to high Gas fees</h5>
      <p>
        Gas on the Neon network refers to the unit that measures the amount of
        computational effort required to execute specific operations. Gas fees
        in Neon are the transaction costs users pay to have their transactions
        processed and validated by the network's miners. Gas fees vary depending
        on network congestion, transaction complexity, and the amount of gas a
        user is willing to pay.
      </p>
      <p>
        Gas fees can be particularly high during periods of network congestion.
        As a result, LPs might face increased costs when adding or removing
        liquidity, making adjustments to their positions, or claiming liquidity
        mining incentives. If the gas fees are higher than the returns they get
        from providing liquidity, LPs may end up with a net loss.
      </p>
      <h5>How Sobal aims to mitigate this risk:</h5>
      <ul>
        <li>
          The Sobal Smart Order router is used to route liquidity efficiently
          via pools to minimize price impact.
        </li>
        <li>
          The Sobal App UI gives LP’s control over their slippage settings.
        </li>
        <li>
          LP’s are warned via the Sobal App UI when the price impact is
          excessive. Once price impact exceeds a certain threshold, the Sobal
          App UI prevents user’s from executing a transaction where they would
          otherwise get rekt.
        </li>
      </ul>
      <h5>How LP’s can mitigate this risk:</h5>
      <ul>
        <li>
          Users should review their slippage settings and potential price impact
          before adding or removing liquidity.
        </li>
        <li>
          Users should also review gas prices and the potential gas fee before
          any transaction. This information is usually provided by their wallet
          provider.
        </li>
      </ul>
    </div>

    <div :id="RiskKey.ImpermanentLoss" class="risk">
      <h4>Impermanent loss</h4>
      <p>
        Impermanent loss is a risk that liquidity providers (LPs) face when
        providing liquidity to an automated market maker (AMM) like Sobal. It is
        the difference between the value of holding assets in a pool versus
        holding them outside of the pool.
      </p>
      <p>
        If the price of the assets in the pool changes, LPs may experience a
        loss compared to holding the assets outside of the pool. This can happen
        because the AMM algorithm rebalances the pool to maintain a constant
        ratio of the assets in the pool. If the price of one asset increases,
        the algorithm will sell some of that asset and buy more of the other
        asset to maintain the ratio. This means that LPs will sell the asset
        that is increasing in price and buy the asset that is decreasing in
        price, resulting in a loss.
      </p>
      <p>
        This risk is particularly relevant for pools with volatile assets where
        token prices are likely diverge over time.
      </p>
      <h5>How does Sobal work to mitigate this risk?</h5>
      <ul>
        <li>
          All AMMs either have impermanent loss or reduced yield to LPs. Sobal
          aims to make its pools as capital efficient as possible so that the
          yield LPs make is more likely to exceed any impermanent loss.
        </li>
        <li>
          The Sobal protocol supports unbalanced pools which LPs can use to
          reduce impermanent loss. For example, there is lower impermanent loss
          in an 80/20 pool (or any other unbalanced pools) versus a 50/50 pool
          with the same underlying tokens.
        </li>
        <li>
          Note: Some ecosystem developers are building on top of Sobal to create
          novel pools, including Managed Pools, with rebalancing algorithms
          designed to minimize impermanent loss.
        </li>
      </ul>
      <h5>How can LPs mitigate this risk?</h5>
      <ul>
        <li>
          LPs should consider the risk of impermanent risk carefully before
          providing liquidity to a Sobal pool.
        </li>
        <li>
          The longer an LP holds their position, the more likely it is that
          their yield from swap fees offset and exceed any impermanent loss,
          assuming the price divergence of the token prices isn’t extreme.
        </li>
        <li>
          LPs may consider providing liquidity into pools with less likelihood
          of token price divergence. For example, stable pools or boosted pools.
        </li>
        <li>
          LP’s should consider providing liquidity in unbalanced pools, like
          80/20 pools which result in less impermanent loss versus a 50/50 pool
          with the same underlying tokens.
        </li>
      </ul>
    </div>

    <div :id="RiskKey.UI" class="risk">
      <h4>User Interface (UI) risk</h4>
      <p>
        DeFi users, including liquidity providers and swappers, typically
        interact with front-end user interfaces to interact with a protocol’s
        smart contracts. An example is the app.sobal.fi front-end UI instance
        which interacts with Sobal Protocol smart contracts.
      </p>

      <p class="mb-0">
        A few risks of using front-ends to manage liquidity positions in DeFi:
      </p>
      <ul>
        <li>
          UIs may not always display timely, accurate data. This may be due to
          the use of third party data services experiencing periods of downtime
          or network congestion.
        </li>
        <li>
          UIs could be maliciously updated or exploited by rogue developers.
        </li>
        <li>UIs may be updated and remove certain feature sets.</li>
        <li>
          UIs may block certain wallet addresses or user’s in certain
          jurisdictions to comply with their regulations.
        </li>
        <li>
          UIs may experience periods of downtime or potentially be discontinued.
          UIs may also be shut down or have access denied to users in certain
          jurisdictions.
        </li>
      </ul>

      <h5>How does Sobal work to mitigate this risk?</h5>
      <ul>
        <li>
          Since the Sobal smart contracts can be interacted with by any
          front-end UI, there is less reliance on any one single UI. The Sobal
          App UI code is open source with an MIT License which allow other third
          party developers to fork the code, make improvements and compete for
          users.
        </li>
        <li>
          Users or third party developers can keep track of changes and review
          the open source repository on the Sobal Github for potential malicious
          code.
        </li>
        <li>
          The developers of the Sobal App UI have provided instructions on how
          to clone and run local environments of the app. This allows people to
          have the ability to keep deprecated features or modify the code to add
          new features that they prefer.
        </li>
      </ul>
      <h5>How can LPs mitigate this risk?</h5>
      <ul>
        <li>
          LP’s can learn how to interact with Sobal smart contracts on third
          party websites, like
          <a class="link" href="https://neonscan.org/">Neonscan</a>.
        </li>
        <li>
          To mitigate the risks of downtime or lack of access, users can fork
          the open source code and run their own local instance.
        </li>
      </ul>
    </div>

    <div :id="RiskKey.Regulatory" class="risk">
      <h4>Regulatory risk</h4>
      <p>
        The regulatory frameworks applicable to blockchain transactions in
        connection with tokens and stablecoins are still developing and
        evolving. In addition, the increasing complexity of DeFi applications
        and their interactions can make it difficult to assess and regulate them
        effectively. This could potentially lead to increased regulatory
        scrutiny or even a regulatory crackdown, which could have negative
        consequences for participants, our efforts to mitigate risks and the
        entire DeFi ecosystem.
      </p>
      <p>
        It's also possible that the Sobal App UI may be wholly or partially
        suspended or terminated for any or no reason, which may limit your
        access to your tokens via this website. In this scenario, you may be
        able to recover funds by forking the open-source code on
        <a class="link" href="https://github.com/sobal/frontend-v2/">Github</a>
        and running your own local instance, or by using a third party website,
        like <a class="link" href="https://neonscan.org/">neonscan</a>.
      </p>
    </div>
    <hr />
    <div :id="RiskKey.PoolType" class="risk">
      <h3>Pool type risks</h3>
      <p>
        Sobal is designed to be infinitely extendible to allow for any
        conceivable pool type with custom curves, logic and parameters, and
        more. The general risks of the most popular pool types are listed below.
      </p>
    </div>
    <div :id="RiskKey.Weighted" class="risk">
      <h4>Weighted Pools</h4>
      <p>
        Weighted Pools use&nbsp;<a
          class="link"
          href="https://docs.sobal.fi/v/developers/math/weighted-math"
          >Weighted math</a
        >, which makes them great for general cases, including tokens that don't
        necessarily have any price correlation (ex. DAI/WETH). Unlike weighted
        pools in other AMMs that only provide 50/50 weightings, Sobal Weighted
        Pools enable users to build pools with more than two tokens and custom
        weightings, such as pools with 80/20 or 60/20/20 weightings. Some risks
        of weighted pools include:
      </p>
      <ul>
        <li>
          Impermanent loss on volatile non-correlated assets
          <ul>
            <li>See above for details of impermanent loss risks.</li>
          </ul>
        </li>
        <li>
          Toxic token risk
          <ul>
            <li>
              Sobal weighted pools are not limited to just having two tokens.
              The more tokens in a pool, the more risk that one of these could
              become toxic.
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div :id="RiskKey.Stable" class="risk">
      <h4>Stable Pools</h4>
      <h5>Loss of stablecoin peg</h5>
      <p>
        Stablecoins are tokens whose value is intended to be pegged or tied to
        that of another asset, which could be a currency, commodity or financial
        instrument. There are many types of stablecoins, some are risky than
        others depending on product design including evidence of reserves to
        support the peg in times of stress. Some example types of stablecoins
        include:
      </p>
      <ul>
        <li>
          Peg is secured by real world reserves
          <ul>
            <li>e.g. USDC secured by USD reserves</li>
          </ul>
        </li>
        <li>
          Peg is secured by other crypto assets
          <ul>
            <li>
              e.g. DAI secured by an over-collateralized basket of crypto assets
            </li>
          </ul>
        </li>
        <li>
          Peg is secured by smart contract algorithms
          <ul>
            <li>
              e.g. <code>UST</code> which aimed to be secured by algorithmic
              rebalances to reflect the peg.
            </li>
          </ul>
        </li>
      </ul>
      <p>
        Depegging occurs when a stablecoin losses its peg to the target asset.
        In stable pools, if a stablecoin depegs, LPs may incurs losses. This is
        because liquidity pools typically sell the winners (tokens moving up in
        price) and accumulate the losers (tokens moving down in price). In the
        case of a USD-pegged stable pool, if an asset permanently loses it’s peg
        to $1 and goes down in value, the pool will sell any pegged assets and
        accumulate the asset which has lost it’s peg, leading to an overall loss
        of funds for LPs.
      </p>
    </div>

    <div :id="RiskKey.ComposableStable" class="risk">
      <h4>Composable Stable Pools &amp; MetaStable Pools</h4>
      <p>
        Composable Stable Pools are designed for assets that are either expected
        to consistently trade at near parity, or at a known exchange rate.
        Composable Stable Pools use Stable Math (based on StableSwap,
        popularized by Curve) which allows for trades of significant size before
        encountering substantial price impact, vastly increasing capital
        efficiency for like-kind and correlated-kind swaps. They are ideal for:
      </p>
      <ul>
        <li>
          Pegged Tokens: Tokens that trade near 1:1, such as two stablecoins of
          the same currency (eg: DAI, USDC, USDT), or synthetic assets (eg:
          renBTC, sBTC, WBTC)
        </li>
        <li>
          Correlated Tokens: Tokens that trade near each other with some slowly
          changing exchange rate, like derivatives (eg: wstETH, wETH)
        </li>
      </ul>
      <p>
        Note: Composable Stable Pools are a superset of all previous Stable-type
        pools (Stable Pools, MetaStable Pools, StablePhantom Pools, and
        StablePool v2) and therefore obsolete all previous pools.
      </p>
      <p>
        Composable Stable Pools (including MetaStable Pools) carry the all of
        the same risks as stable pools, including the potential depegging of
        constituent stablecoin tokens. In addition, there are risks associated
        with the involvement of rate providers.
      </p>
      <div :id="RiskKey.RateProvider" class="!pb-0 risk">
        <h5>Rate provider risk</h5>
        <p>
          Rate Providers are contracts that provide an exchange rate between two
          assets. These exchange rates can come from any on-chain source,
          whether that may be an oracle, a ratio of queryable balances, or
          another calculation.
        </p>
        <p>
          This introduces risks around the rate provider being able to supply
          accurate and timely exchange rates between pool tokens.
        </p>

        <div :id="RiskKey.Oracle" class="!pb-0 risk">
          <h6>Oracle risk</h6>
          <p>
            Oracles are data providers which supply external information to
            smart contracts. Oracles, like Chainlink, may be used to source
            exchange rates between pool tokens for a rate provider in Sobal
            MetaStable pools. The risks of using Oracles to supply exchange
            rates include:
          </p>
          <ul>
            <li>
              Data accuracy: Oracles must provide accurate data for DeFi
              applications to function correctly. Inaccurate data can cause
              significant issues, such as incorrect pricing or faulty execution
              of smart contracts.
            </li>
            <li>
              Data availability: If an oracle experiences downtime or fails to
              update its data feed, the DeFi applications relying on it might
              not function correctly or become temporarily unusable, leading to
              potential losses for users.
            </li>
            <li>
              Latency: The time it takes for an oracle to fetch, process, and
              transmit data to a smart contract can impact the performance and
              efficiency of DeFi applications. High latency could lead to
              outdated data or missed opportunities.
            </li>
            <li>
              Oracle manipulation: Bad actors might attempt to manipulate an
              oracle's data feed to influence the outcome of a smart contract or
              profit from price discrepancies. This can lead to unintended
              consequences, such as liquidations, loss of funds, or arbitrage
              opportunities for attackers.
            </li>
            <li>
              Centralization risk: If an oracle relies on a centralized data
              source or a small number of data providers, it becomes a single
              point of failure. This centralization goes against the core
              principles of decentralization in the DeFi ecosystem and exposes
              the system to potential manipulation or downtime.
            </li>
            <li>
              Exploitation of vulnerabilities: Oracles themselves can have
              security vulnerabilities, which, if exploited, can compromise the
              entire DeFi system relying on them.
            </li>
          </ul>
        </div>
        <div :id="RiskKey.RateProviderBridge" class="!pb-0 risk">
          <h6>Rate provider cross-chain bridge risk</h6>
          <p>
            Pools may use rate providers that are bridged between blockchain
            networks.
          </p>
          <p>
            In these pools, LP's are exposed to risk of significant losses if an
            incorrect rate is received.
          </p>
        </div>
      </div>
    </div>

    <div :id="RiskKey.Boosted" class="risk">
      <h4>Boosted Pools</h4>
      <p>
        Typically, only 10% or less of the liquidity deposited into an AMM pool
        is being utilized by traders because the trade sizes are much smaller
        than the available liquidity. Boosted Pools allow the remaining portion
        of liquidity to be sent to lending protocols where the liquidity can
        earn additional yield for accepting inherent risks.
      </p>
      <ul>
        <li>
          Boosted Pools are designed to allow for greater capital efficiency,
          deeper liquidity, and increased yield for Liquidity Providers.
        </li>
        <li>
          For traders, Boosted Pools are a cheaper entry/exit into lending
          protocols like Aave.
        </li>
        <li>
          Boosted Pools increase the opportunity for LPs to gain exposure to a
          wide variety of yield increases from multiple yield protocols.
        </li>
      </ul>
      <h5>
        Third party lending platform risk exposure (DeFi composability risk)
      </h5>
      <p>
        Since boosted pools deposit excess liquidity into lending protocols,
        like Aave, to generate yield, LPs must fully understand the risks of the
        underlying lending protocol since a portion of their funds will be
        exposed to the risks of that protocol. Some of the risks of the
        underlying lending protocol may include smart contract bugs, economic
        attack vulnerabilities and counterparty risk from the protocol’s
        borrowers. Lending platforms may also use
        <router-link to="risks#oracles"
          ><span class="link">Oracles</span></router-link
        >
        which face additional risks (described above).
      </p>

      <p>
        Also note, some Boosted pools, like those by Tetu and Idle may use
        strategies that utilize multiple yield protocols in order to maximize
        yield. Since these strategies may change exposure to the underlying
        yield protocols at any time, LP's must accept the risk that the protocol
        utilizing these strategies carefully vets all third party protocols to
        reduce composability risks.
      </p>

      <p>
        If the underlying lending protocol were to get hacked, LPs in a boosted
        pool that deposits liquidity in that protocol could lose funds.
      </p>
      <h5>Depegging risk</h5>
      <p>
        Individual stablecoin tokens within Boosted Pools are subject to
        <router-link to="risks#stable-pools"
          ><span class="link">depegging risks</span></router-link
        >, as described above.
      </p>
    </div>
    <hr />
    <div :id="RiskKey.Network" class="risk">
      <h3>Layer 2 network risks</h3>
      <p>
        Sidechains and Layer 2 networks can offer advantages over Ethereum
        Mainnet, like faster transaction times and lower fees. However, they
        come with their own set of risks and trade-offs.
      </p>
      <p>
        For example, sidechains and Layer 2 networks often have a different
        security models. They may rely on a smaller set of validators or
        different consensus mechanisms, which could potentially make them more
        susceptible to attacks or centralization risks.
      </p>
      <p>
        In addition, there are bridging risks when user’s move funds between
        networks. Asset bridges rely on smart contracts to facilitate transfers
        between chains. These contracts may have vulnerabilities, which could
        expose users' funds to risks during the bridging process.
      </p>
    </div>
    <div :id="RiskKey.Neonevm" class="risk">
      <h4>Neon EVM risks</h4>
      <p>
        <a class="link" href="https://neonevm.org/">Neon EVM</a> is a Beta EVM
        residing within the Solana network, bringing EVM functionality to
        Solana.
      </p>
      <p>
        Read more about the Neon EVM to understand the potential risks via
        <a
          class="link"
          href="https://docs.neonfoundation.io/docs/architecture/neon_evm_arch"
          >Neon Foundation Docs</a
        >.
      </p>
    </div>

    <hr />
    <div>
      <p>
        Navigating these challenges calls for active engagement and open
        communication within the community. Sharing insights, feedback, or
        concerns can contribute to building a safer and more inclusive
        environment for all. Please feel free to reach out with any questions,
        suggestions or propose changes for this page directly via the
        <a
          class="link"
          href="https://github.com/sobal/frontend-v2/blob/develop/src/pages/risks.vue"
          >Sobal Github</a
        >.
      </p>
    </div>
  </div>
</template>
<style scoped>
.nav {
  @apply bg-blue-50/70 dark:bg-blue-500/10 px-5 pt-8 pb-4 mb-14;
}

.risks {
  scroll-margin-top: 100px;
}

.risk {
  padding-top: 100px;
  margin-top: -100px;
  padding-bottom: 32px;
}

.toc-link {
  @apply hover:text-blue-600 dark:hover:text-blue-400 transition-all;
}
</style>
